# Create your tasks here

import os
import re
import time
import datetime
import random
import numpy as np
import requests

import pandas as pd

from celery import chain, shared_task, group

from app.models import Agreements, Task, Transactions, Account, Type, TypeRule


@shared_task(bind=True)
def add(self):
    time.sleep(3)
    print(f"TASK DOOOOOOO !")


@shared_task(bind=True)
def task_pool(self, agreement_id, access_token):
    # time.sleep(5)
    # print("Waited 5s")
    # return True
    agreement_element = Agreements.objects.filter(agreement_id=agreement_id).first()
    print(
        f"Starting task for {agreement_element.institution_id}:{agreement_element.agreement_id}"
    )
    HEADERS = {
        "accept": "application/json",
        "Authorization": "Bearer " + access_token,
    }
    # Step 3: Check if active -> Get !FIRST account from agreement
    r = requests.get(
        f"https://bankaccountdata.gocardless.com/api/v2/requisitions/{agreement_element.agreement_id}/",
        headers=HEADERS,
    )
    if r.status_code != 200:
        print("ID not found")
        return True
    data = r.json()
    print(data)

    # Step 3.5: Create account if not exist
    if not data.get("accounts"):
        return False
    account_id = data.get("accounts")[0]
    account_obj = Account.objects.filter(account_id=account_id).first()
    if not account_obj:
        account_obj = Account.objects.create(account_id=account_id)

    agreement_element.status = data.get("status")
    agreement_element.account = account_obj
    agreement_element.save()
    # if account not active for one day -> delete
    if (
        agreement_element.status != "LN"
        and (
            datetime.datetime.now(datetime.timezone.utc) - agreement_element.created_at
        ).days
        >= 1
    ):
        # agreement_element.delete() #! UNCOMMENT AFTER DEBUGGING
        print(
            f"Account for deletion: {agreement_element.institution_id}:{agreement_element.agreement_id}"
        )

    # if account not active -> skip fetching
    if agreement_element.status != "LN":
        print(
            f"Skipping: {agreement_element.institution_id}:{agreement_element.agreement_id}"
        )
        return True

    # Step 4: Get transactions from account
    print(f"Account id: {account_id}")
    r = requests.get(
        f"https://bankaccountdata.gocardless.com/api/v2/accounts/{account_id}/transactions/",
        headers=HEADERS,
    )
    if r.status_code != 200:
        print("Error fetching data from account")
        print(r.json())
        return True
    data = r.json()
    data = data["transactions"]["booked"]

    df = pd.DataFrame(data)
    df["currency"] = df["transactionAmount"].apply(lambda x: x["currency"])
    df["amount"] = df["transactionAmount"].apply(lambda x: x["amount"])
    df["balance_after"] = df["balanceAfterTransaction"].apply(
        lambda x: x["balanceAmount"]["amount"]
    )
    #! df["transactionsAccount"] = account_id
    df["transaction_id"] = (
        account_id + ":" + df["transactionId"].apply(lambda x: str(x).replace(";", ""))
    )
    df.columns = df.columns.str.lower()
    df["debtor_name"] = df["debtorname"]
    df["debtor_account"] = df["debtoraccount"]
    df["creditor_name"] = df["creditorname"]
    df["creditor_account"] = df["creditoraccount"]
    df["value_date"] = df["valuedate"]
    df["description"] = df["remittanceinformationunstructured"]
    df = df.filter(
        items=[
            "currency",
            "amount",
            "balance_after",
            "transaction_id",
            "debtor_name",
            "debtor_account",
            "creditor_name",
            "value_date",
            "description",
        ]
    )
    df = df.replace(np.nan, "", regex=True)
    transaction_book = df.to_dict(orient="records")
    print(transaction_book)  #! continuity broken

    # Step 5: Save to db transactions that are not already saved
    objs = Transactions.objects.bulk_create(
        [
            Transactions(account=account_obj, **transaction)
            for transaction in transaction_book
        ],
        ignore_conflicts=True,
    )


@shared_task(bind=True)
def type_assigning(self, pass_val):
    # Step 6: Update type for new transactions
    new_rules = TypeRule.objects.all().filter(new_flag=True)
    print(new_rules)
    if new_rules:
        new_transactions = Transactions.objects.all().filter(type_manual__isnull=True)
        new_rules.update(new_flag=False)
    else:
        new_transactions = Transactions.objects.all().filter(
            type=None, type_manual__isnull=True
        )
    all_rules = TypeRule.objects.all().order_by("importance")
    print(
        "[TYPE_RULE_CHECK] : Transactions to edit",
        len(new_transactions),
        "Rules to check",
        len(all_rules),
        "Is checking all rules: ",
        bool(new_rules),
    )
    update_list = []

    # Find or create the "internal transfer" rule
    internal_transfer_type = Type.objects.all().filter(type="Internal transfer").first()
    if not internal_transfer_type:
        # If the type doesn't exist, create it
        internal_transfer_type = Type.objects.create(type="Internal transfer")
        internal_transfer_type.save()
    none_type = Type.objects.all().filter(type="Not assign").first()
    if not none_type:
        # If the type doesn't exist, create it
        none_type = Type.objects.create(type="Not assign")
        none_type.save()

    for transaction in new_transactions:
        if (
            transaction.debtor_account
            or transaction.creditor_account
            or transaction.debtor_name
            or transaction.creditor_name
        ):
            transaction.type = internal_transfer_type
            update_list.append(transaction)
            continue

        for rule_obj in all_rules:
            if rule_obj.rule.search(transaction.description):
                transaction.type = rule_obj.type
                update_list.append(transaction)
                break
        else:
            transaction.type = none_type
            update_list.append(transaction)

    Transactions.objects.bulk_update(update_list, ["type"])


@shared_task(bind=True)
def finish_pool(self, pass_val):
    # Step 7: Closing task
    task = Task.objects.all().filter(status="Working").first()
    if pass_val:
        task.status = "Done"
        print("task saved as done")
    else:
        print("task saved as error")
        task.status = "Error"

    task.date_done = datetime.datetime.now(datetime.timezone.utc)
    task.save()


@shared_task(bind=True)
def fetch_transactions_data(self, pass_val={}):
    # run task if not running and log everything to db
    task = Task.objects.all().filter(status="Working").first()
    if task:
        print("task already working")
        return False

    task = Task.objects.create()
    task.save()
    print("task saved as working")

    # Step 1: load or get secret to api
    headers = {"accept": "application/json", "Content-Type": "application/json"}
    payload = {
        "secret_id": os.environ.get("GOCARDLESS_SECRET_ID"),
        "secret_key": os.environ.get("GOCARDLESS_SECRET_KEY"),
    }
    print(payload)
    r = requests.post(
        "https://bankaccountdata.gocardless.com/api/v2/token/new/",
        headers=headers,
        json=payload,
    )

    #! Implement retry 3 times and report of filature
    if r.status_code != 200:
        return False

    YOUR_ACCESS_TOKEN = r.json()["access"]
    print(YOUR_ACCESS_TOKEN)

    # Step 2: get agreements ids and create task pool
    query = Agreements.objects.all()
    run_chain = chain(
        group(
            [
                task_pool.s(query_element.agreement_id, YOUR_ACCESS_TOKEN)
                for query_element in query
            ]
        ),
        type_assigning.si(""),
        finish_pool.si(True),
    )

    res = run_chain.apply_async()
    return True


@shared_task(bind=True)
def delete_expired_agreements(self):
    pass


# @shared_task
# def mul(x, y):
#     return x * y


# @shared_task
# def xsum(numbers):
#     return sum(numbers)


# @shared_task
# def count_widgets():
#     return Agreements.objects.count()


# @shared_task
# def rename_widget(widget_id, name):
#     w = Widget.objects.get(id=widget_id)
#     w.name = name
#     w.save()
