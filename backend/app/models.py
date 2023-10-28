from datetime import datetime
from django.db import models


# Create your models here.
class Category(models.Model):
    custom_name = models.CharField(blank=True, null=True, unique=True)

    def __str__(self):
        return str(self.custom_name)


class Agreements(models.Model):
    agreement_id = models.CharField(max_length=200, unique=True)
    created_at = models.DateTimeField(default=datetime.now, blank=True)
    expires_at = models.DateTimeField()
    institution_id = models.CharField(max_length=200)
    category = models.ForeignKey(
        Category,
        default=None,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    logo_url = models.CharField(max_length=200)
    status = models.CharField(max_length=2)

    def __str__(self):
        return f"{self.institution_id}:{self.agreement_id}"


class Transactions(models.Model):
    transaction_id = models.CharField(
        max_length=200, unique=True
    )  # account_id:transaction_id
    agreement = models.ManyToManyField(Agreements, through="Account")
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    value_date = models.DateTimeField()
    description = models.CharField(max_length=500)  # remittanceInformationUnstructured
    balance_after = models.DecimalField(max_digits=6, decimal_places=2)
    debtor_name = models.CharField(max_length=200, null=True, blank=True)
    debtor_account = models.CharField(max_length=200, null=True, blank=True)
    creditor_name = models.CharField(max_length=200, null=True, blank=True)
    creditor_account = models.CharField(max_length=200, null=True, blank=True)
    currency = models.CharField(max_length=50)


class Account(models.Model):
    account_id = models.CharField(max_length=200, unique=True)
    agreements = models.ForeignKey(Agreements, on_delete=models.SET_NULL, null=True)
    transactions = models.ForeignKey(Transactions, on_delete=models.SET_NULL, null=True)


# class Category(models.Model):


#     def __str__(self):
#         return


# class Transaction(models.Model):
#     amount = models.

#     def __str__(self):
#         return
