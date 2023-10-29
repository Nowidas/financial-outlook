# Create your tasks here

import os
import time
import datetime
import random
import requests

import pandas as pd

from celery import shared_task, group

from app.models import Agreements, Transactions


@shared_task(bind=True)
def add(self):
    time.sleep(3)
    print(f"TASK DOOOOOOO !")


@shared_task(bind=True)
def task_pool(self, agreement_id, access_token):
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
    account_id = data.get("accounts")[0] if data.get("accounts") else None
    agreement_element.status = data.get("status")
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
        account_id
        + ":"
        + df["transactionId"].apply(lambda x: str(x).replace(";", ""))
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
    transaction_book = df.to_dict(orient='records')
    print(transaction_book) #! continuity broken

    objs = Transactions.objects.bulk_create(
        [Transactions(**transaction) for transaction in transaction_book],
        ignore_conflicts=True
    )


@shared_task(bind=True)
def fetch_transactions_data(self):
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
        return True

    YOUR_ACCESS_TOKEN = r.json()["access"]
    print(YOUR_ACCESS_TOKEN)

    # Step 2: get agreements ids and create task pool
    query = Agreements.objects.all()
    run_group = group(
        [
            task_pool.s(query_element.agreement_id, YOUR_ACCESS_TOKEN)
            for query_element in query
        ]
    )
    res = run_group()
    return res


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