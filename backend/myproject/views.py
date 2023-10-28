from django.http import JsonResponse
from datetime import datetime

from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import permissions
from app.serializers import UserSerializer, GroupSerializer


def index(request):
    current_time = datetime.now().strftime("%-I:%S %p")
    current_date = datetime.now().strftime("%A %m %-Y")

    data = {
        "time": current_time,
        "date": current_date,
    }

    return JsonResponse(data)
