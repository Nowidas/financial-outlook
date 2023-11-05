from datetime import datetime
from django.db import models


# Create your models here.
class Category(models.Model):
    custom_name = models.CharField(blank=True, null=True, unique=True)

    def __str__(self):
        return str(self.custom_name)

class Account(models.Model):
    account_id = models.CharField(max_length=200, unique=True)
    def __str__(self):
        return f"{self.account_id}"

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
    account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.institution_id}:{self.agreement_id}"


class Transactions(models.Model):
    transaction_id = models.CharField(
        max_length=200, unique=True
    )  # account_id:transaction_id
    account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    value_date = models.DateField()
    description = models.CharField(max_length=500)  # remittanceInformationUnstructured
    balance_after = models.DecimalField(max_digits=6, decimal_places=2)
    debtor_name = models.CharField(max_length=200, null=True, blank=True)
    debtor_account = models.CharField(max_length=200, null=True, blank=True)
    creditor_name = models.CharField(max_length=200, null=True, blank=True)
    creditor_account = models.CharField(max_length=200, null=True, blank=True)
    currency = models.CharField(max_length=50)
    
    def __str__(self) -> str:
        return f"{self.amount}{self.currency} - {self.description} ({self.transaction_id})"

class Task(models.Model):
    status = models.CharField(default="Working")
    date_done = models.DateTimeField(default=datetime.now, null=True, blank=True)
    affected_account = models.ManyToManyField(Agreements, null=True)
    def __str__(self) -> str:
        return f"{self.status}"
