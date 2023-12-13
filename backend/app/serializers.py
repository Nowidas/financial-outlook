from django.contrib.auth.models import User, Group
from rest_framework import serializers

from rest_framework.response import Response
from rest_framework import status

from app.models import Account, Agreements, Category, Transactions, Task, Type, TypeRule


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
    agreements = AgreementsSerializer()

    class Meta:
        model = Account
        fields = "__all__"


class TypeSerializer(serializers.HyperlinkedModelSerializer):
    rules = serializers.SerializerMethodField("get_member_purchases")

    def get_member_purchases(self, instance):
        mem_purchases = instance.typerule_set.all()
        purchases = []
        for pur in mem_purchases:
            serializer = TypeRuleSerializer(
                pur, context={"request": self.context.get("request")}
            )
            purchases.append(
                {
                    "url": serializer.data["url"],
                    "rule": pur.rule.pattern,
                    "importance": pur.importance,
                    "new_flag": pur.new_flag,
                }
            )
        return purchases

    class Meta:
        model = Type
        fields = "__all__"


class TypeRuleTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Type
        fields = "__all__"
        extra_kwargs = {
            "type": {
                "validators": [],
            }
        }


class TypeRuleSerializer(serializers.HyperlinkedModelSerializer):
    type = TypeRuleTypeSerializer()

    class Meta:
        model = TypeRule
        fields = "__all__"

    def create(self, validated_data):
        # Extract type data
        type_data = validated_data.pop("type", None)

        # Attempt to get an existing Type instance
        existing_type = Type.objects.filter(**type_data).first()

        if existing_type:
            # If Type already exists, use the existing type
            validated_data["type"] = existing_type
        else:
            # If Type doesn't exist, create a new instance
            new_type = Type.objects.create(**type_data)
            validated_data["type"] = new_type

        # Create TypeRule instance with the related Type
        type_rule_instance = TypeRule.objects.create(**validated_data)

        return type_rule_instance


class TransactionsSerializer(serializers.HyperlinkedModelSerializer):
    account = AccountSerializer()
    type = TypeSerializer()
    type_manual = TypeSerializer()

    class Meta:
        model = Transactions
        fields = "__all__"


class TransationsAggregaredSerializer(serializers.ModelSerializer):
    sum_amount = serializers.FloatField()
    month = serializers.IntegerField()
    year = serializers.IntegerField()
    is_income = serializers.BooleanField()

    class Meta:
        model = Transactions
        fields = ("month", "year", "sum_amount", "is_income")


class CategoryAggregaredSerializer(serializers.ModelSerializer):
    sum_amount = serializers.FloatField()
    type = serializers.CharField(source="type__type")

    class Meta:
        model = Transactions
        fields = ("type", "sum_amount")


class TaskSerializer(serializers.HyperlinkedModelSerializer):
    #    url = serializers.SerializerMethodField('get_employee_detail_url')

    #    def get_employee_detail_url(self, obj):
    #        # generate the URL for the composite key
    #        ...
    #        return composite_key_url

    class Meta:
        model = Task
        fields = "__all__"
