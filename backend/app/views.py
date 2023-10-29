import json

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User, Group
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import ensure_csrf_cookie
import requests

from rest_framework import viewsets, views
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action

from rest_framework_simplejwt.tokens import RefreshToken

from app.serializers import (
    AccountSerializer,
    UserSerializer,
    GroupSerializer,
    AgreementsSerializer,
    CategorySerializer,
    TransactionsSerializer
)
from app.models import Account, Agreements, Category, Transactions


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


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transactions.objects.all()
    serializer_class = TransactionsSerializer
    permission_classes = [permissions.IsAuthenticated]

class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]



class GetGoCardlessToken(views.APIView):
    """This view make and external api call, save the result and return
    the data generated as json object"""

    # Only authenticated user can make request on this view
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, format=None):
        response = {}
        payload = {
            "secret_id": "55334415-bb5b-472d-8524-08c656f5e3c2",
            "secret_key": "46e8542c1eebbd02771cd3fae01a4584fd9bbc8f6868f4d8429b6efefb6a82b88f6d2625441e2090af38b1f44371199a47274aa58f4e7152cd8aa3061849336e",
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
