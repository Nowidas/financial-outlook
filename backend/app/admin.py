from django.contrib import admin
from app.models import Agreements, Category, Transactions, Account, Task, Type, TypeRule


# # Register your models here.
# class AgreementsAdmin(admin.ModelAdmin):
#     pass

admin.site.register(Agreements)
admin.site.register(Category)
admin.site.register(Transactions)
admin.site.register(Account)
admin.site.register(Task)
admin.site.register(Type)
admin.site.register(TypeRule)
