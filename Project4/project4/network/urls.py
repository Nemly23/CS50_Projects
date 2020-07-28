
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create_post", views.create_post, name="create_post"),
    path("load_posts", views.load_posts, name="load_posts"),
    path("get_page", views.get_page, name="get_page"),
    path("posts/<int:post_id>", views.like_post, name="like_post")
]
