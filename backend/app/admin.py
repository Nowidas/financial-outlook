from django.contrib import admin
from app.models import Agreements, Category, Transactions


# # Register your models here.
# class AgreementsAdmin(admin.ModelAdmin):
#     pass

admin.site.register(Agreements)
admin.site.register(Category)
admin.site.register(Transactions)
