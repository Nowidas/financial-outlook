"""myproject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import include, path, re_path
from django.contrib import admin
from rest_framework import routers
from rest_framework.documentation import include_docs_urls
from rest_framework_simplejwt import views as jwt_views
from rest_framework_simplejwt.authentication import JWTAuthentication
from app import views

router = routers.DefaultRouter()
router.register(r"users", views.UserViewSet)
router.register(r"groups", views.GroupViewSet)
router.register(r"agreements", views.AgreementsViewSet)
router.register(r"category", views.CategoryViewSet)
router.register(r"transactions", views.TransactionViewSet)
router.register(r"account", views.AccountViewSet)
router.register(r"tasks", views.TaskViewSet)
router.register(r"type", views.TypeViewSet)
router.register(r"typerule", views.TypeRuleViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path("", include(router.urls)),
    path("token/", jwt_views.TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", jwt_views.TokenRefreshView.as_view(), name="token_refresh"),
    path(
        "gocardless/token", views.GetGoCardlessToken.as_view(), name="gocardless_token"
    ),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("task/start/", views.TaskControl.as_view()),
    path("claudinary/", views.CloudinaryApiWiew.as_view()),
    path("admin/", admin.site.urls),
]
