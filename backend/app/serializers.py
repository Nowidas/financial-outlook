from django.contrib.auth.models import User, Group
from rest_framework import serializers

from rest_framework.response import Response
from rest_framework import status

from app.models import Account, Agreements, Category, Transactions


class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["url", "username", "email", "groups"]


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ["url", "name"]


class CategorySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Category
        # fields = ["id", "custom_name"]
        fields = "__all__"
        ordering = ["custom_name"]


class AgreementsSerializer(serializers.HyperlinkedModelSerializer):
    category = CategorySerializer()

    class Meta:
        model = Agreements
        fields = "__all__"

    def create(self, validated_data):
        account_data = validated_data.pop("category")
        if not (custom_name := account_data.get("custom_name")):
            agreement = Agreements.objects.create(**validated_data)
            return agreement

        account = Category.objects.filter(custom_name=custom_name).first()
        if not account:
            account = Category.objects.create(custom_name=custom_name)
        validated_data["category"] = account
        agreement = Agreements.objects.create(**validated_data)
        return agreement

    def update(self, instance, validated_data):
        instance.name = validated_data.get("custom_name", instance.name)
        instance.save()
        return instance


class AccountSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Account
        fields = "__all__"
        

class TransactionsSerializer(serializers.HyperlinkedModelSerializer):
    account = AccountSerializer()

    class Meta:
        model = Transactions
        fields = "__all__"
        