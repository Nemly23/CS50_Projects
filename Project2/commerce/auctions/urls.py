from django.urls import path
from django.contrib import admin
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("createlist", views.createlist, name="createlist"),
    path("listingpage/<int:auction_key>", views.listingpage, name="listingpage"),
    path("watchlist", views.watchlist, name="watchlist"),
    path("categories/<int:category_pk>", views.categories, name="categories"),
    path("categories/", views.categories, name="categories"),
    path("admin/", admin.site.urls)
]
