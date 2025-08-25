from django.urls import path
from . import viewsa
from .views import discovery_view, index_view

urlpatterns = [
    path('', index_view.IndexView.as_view(), name='index'),
    path('discover', discovery_view.DiscoveryAPIView.as_view(), name='discover_endpoints'),
    path('auth-code', viewsa.authorization_code, name='authorization_code'),
    path('token', viewsa.token_view, name='token'),
    path('logout', viewsa.logout, name='logout'),
    path('userinfo', viewsa.get_userinfo, name='get_userinfo'),
]
