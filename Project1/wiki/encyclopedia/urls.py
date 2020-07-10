from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<str:entry_name>", views.entry, name="entry"),
    path("search/", views.search, name="search"),
    path("newpage/", views.newpage, name="newpage"),
    path("<str:entry>/edit", views.editpage, name="editpage"),
    path("randompage/", views.randompage, name="randompage")
]
