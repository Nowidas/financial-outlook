from datetime import datetime

import re
from django_regex.fields import RegexField

from django.db import models

from celery.execute import send_task


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
    account = models.OneToOneField(Account, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.institution_id}:{self.agreement_id}"


class Type(models.Model):
    type = models.CharField(max_length=200, unique=True)
    icon_url = models.CharField(max_length=200, null=True, blank=True)

    def __str__(self):
        return str(self.type)


class TypeRule(models.Model):
    type = models.ForeignKey(
        Type,
        default=None,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    rule = RegexField(flags=re.I)
    importance = models.IntegerField(default=0)
    new_flag = models.BooleanField(default=True)

    def __str__(self):
        return str(self.rule)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)  # Call the "real" save() method.
        # send_task("tasks.type_assigning")


class Transactions(models.Model):
    transaction_id = models.CharField(
        max_length=200, unique=True
    )  # account_id:transaction_id
    account = models.ForeignKey(Account, on_delete=models.SET_NULL, null=True)
    amount = models.DecimalField(max_digits=8, decimal_places=2)
    value_date = models.DateField()
    description = models.CharField(max_length=500)  # remittanceInformationUnstructured
    balance_after = models.DecimalField(max_digits=10, decimal_places=2)
    debtor_name = models.CharField(max_length=200, null=True, blank=True)
    debtor_account = models.CharField(max_length=200, null=True, blank=True)
    creditor_name = models.CharField(max_length=200, null=True, blank=True)
    creditor_account = models.CharField(max_length=200, null=True, blank=True)
    currency = models.CharField(max_length=50)
    note = models.CharField(max_length=500, null=True, blank=True)
    type = models.ForeignKey(
        Type,
        default=None,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="transactions",
    )
    type_manual = models.ForeignKey(
        Type,
        default=None,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="manual_transactions",
    )

    def __str__(self) -> str:
        return (
            f"{self.amount}{self.currency} - {self.description} ({self.transaction_id})"
        )

    class Meta:
        ordering = ("-value_date",)


class Task(models.Model):
    status = models.CharField(default="Working")
    date_done = models.DateTimeField(default=datetime.now, null=True, blank=True)
    affected_account = models.ManyToManyField(Agreements, null=True)

    def __str__(self) -> str:
        return f"{self.status}"
