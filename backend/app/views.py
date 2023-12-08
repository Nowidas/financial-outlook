import os
import datetime
import json
import re
from django.forms import MultipleChoiceField

import cloudinary
import cloudinary.uploader
import cloudinary.api

from django.shortcuts import get_object_or_404, render
from django.http import JsonResponse
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.urls import resolve
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models.functions import ExtractMonth, ExtractYear
from django.db.models import Sum, Case, When, Value
import requests

from rest_framework import viewsets, views, generics
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from rest_framework_simplejwt.tokens import RefreshToken

from django_filters import rest_framework as filters

from app.serializers import (
    AccountSerializer,
    UserSerializer,
    GroupSerializer,
    AgreementsSerializer,
    CategorySerializer,
    TransactionsSerializer,
    TransationsAggregaredSerializer,
    TaskSerializer,
    TypeRuleSerializer,
    TypeSerializer,
)
from app.models import (
    Account,
    Agreements,
    Category,
    Transactions,
    Task,
    Type,
    TypeRule,
)
from app.tasks import fetch_transactions_data, type_assigning


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


# Create your views here.
class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """

    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


from rest_framework import mixins


class AgreementsViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows agreements to be viewed or edited.
    """

    queryset = Agreements.objects.all().order_by("id")
    serializer_class = AgreementsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        custom_name = request.data.get("custom_name")
        category = Category.objects.filter(custom_name=custom_name).first()
        if not category:
            category = Category.objects.create(custom_name=custom_name)
        instance.category = category
        instance.save()
        return Response(status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows agreements to be viewed or edited.
    """

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_200_OK)


class TransactionFilter(filters.FilterSet):
    amount = filters.RangeFilter()
    # Custom multiple choice filter for categories
    category = filters.CharFilter(
        method="filter_category",
    )

    def filter_category(self, queryset, name, value):
        categories = value.split(",")
        return queryset.filter(
            account__agreements__category__custom_name__in=categories
        )

    value_date = filters.DateFromToRangeFilter()

    class Meta:
        model = Transactions
        fields = ["amount", "value_date", "category"]


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transactions.objects.all().order_by("-value_date", "transaction_id")
    serializer_class = TransactionsSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.DjangoFilterBackend]
    filterset_class = TransactionFilter

    @action(detail=False)
    def sum(self, request):
        filter_queryset = self.filter_queryset(self.get_queryset())
        queryset = (
            filter_queryset.annotate(
                month=ExtractMonth("value_date"),
                year=ExtractYear("value_date"),
                is_income=Case(
                    When(amount__gt=0, then=Value(True)),
                    default=Value(False),
                ),
            )
            .values(
                "month",
                "year",
                "account__agreements__category__custom_name",
                "is_income",
            )
            .annotate(
                sum_amount=Sum("amount"),
            )
            .order_by("account__agreements__category__custom_name", "year", "month")
        )

        serializer = TransationsAggregaredSerializer(queryset, many=True)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        print("update", request.data)
        instance = self.get_object()
        type_url = request.data.get("type_manual")

        if type_url:
            # Use a regular expression to extract the ID from the URL
            match = re.search(r"/type/(?P<type_id>\d+)/$", type_url)

            if match:
                type_id = match.group("type_id")
                type_obj = Type.objects.filter(id=type_id).first()

                if type_obj:
                    instance.type_manual = type_obj
                else:
                    return Response(status=status.HTTP_404_NOT_FOUND)
            else:
                return Response(
                    status=status.HTTP_400_BAD_REQUEST,
                    data={"detail": "Invalid type_manual URL"},
                )
        else:
            # Set type_manual to null (None) if no URL is provided
            instance.type_manual = None

        instance.save()
        return Response(status=status.HTTP_200_OK)


class TypeRuleViewSet(viewsets.ModelViewSet):
    queryset = TypeRule.objects.all()
    serializer_class = TypeRuleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Your custom logic for create
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Save the object
            self.perform_create(serializer)
            type_assigning.si(True).apply_async()
            # Your custom response data
            response_data = {"message": "Object created successfully"}

            return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # def destroy(self, request, *args, **kwargs):
    #     # Your custom logic for delete
    #     print(request.data)
    #     serializer = self.get_serializer(data=request.data)
    #     print(serializer.is_valid())
    #     if serializer.is_valid():
    #         # Save the object
    #         self.perform_destroy(serializer)
    #         type_assigning.si(True).apply_async()
    #         # Your custom response data
    #         response_data = {"message": "Object deleted successfully"}

    #         return Response(response_data, status=status.HTTP_204_NO_CONTENT)
    #     else:
    #         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_destroy(self, instance):
        instance.delete()
        Transactions.objects.filter(type=instance.type).update(type=None)
        type_assigning.si(True).apply_async()


class TypeViewSet(viewsets.ModelViewSet):
    queryset = Type.objects.all()
    serializer_class = TypeSerializer
    permission_classes = [permissions.IsAuthenticated]


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Task.objects.all()

    @action(detail=False)
    def last(self, request):
        recent_tasks = [Task.objects.all().order_by("-date_done").first()]

        page = self.paginate_queryset(recent_tasks)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(recent_tasks, many=True)
        return Response(serializer.data)


class TaskControl(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, format=None):
        if_task_created = fetch_transactions_data.apply_async()
        if if_task_created:
            return Response(status=status.HTTP_200_OK)


class GetGoCardlessToken(views.APIView):
    """This view make and external api call, save the result and return
    the data generated as json object"""

    # Only authenticated user can make request on this view
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, format=None):
        response = {}
        payload = {
            "secret_id": os.environ.get("GOCARDLESS_SECRET_ID"),
            "secret_key": os.environ.get("GOCARDLESS_SECRET_KEY"),
        }
        headers = {"accept": "application/json", "Content-Type": "application/json"}

        # Make an external api request ( use auth if authentication is required for the external API)
        r = requests.post(
            "https://bankaccountdata.gocardless.com/api/v2/token/new/",
            json=payload,
            headers=headers,
        )
        r_status = r.status_code
        # If it is a success
        if r_status == 200:
            # convert the json result to python object
            data = r.json()
            # Loop through the credentials and save them
            # But it is good to avoid that each user request create new
            # credentials on top of the existing one
            # ( you can retrieve and delete the old one and save the news credentials )

            response["status"] = 200
            response["message"] = "success"
            response["data"] = data
        else:
            response["status"] = r.status_code
            response["message"] = "error"
            response["credentials"] = {}
        return Response(response)


class CloudinaryApiWiew(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, format=None):
        response = {}
        r = (
            cloudinary.Search()
            .expression("folder:category-icons/*")
            .sort_by("public_id", "desc")
            .max_results("30")
            .execute()
        )
        response["data"] = [el["url"] for el in r["resources"]]
        return Response(response)
