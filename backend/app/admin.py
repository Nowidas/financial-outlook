from django.contrib import admin
from app.models import Agreements, Category, Transactions, Account, Task


# # Register your models here.
# class AgreementsAdmin(admin.ModelAdmin):
#     pass

admin.site.register(Agreements)
admin.site.register(Category)
admin.site.register(Transactions)
admin.site.register(Account)
admin.site.register(Task)
