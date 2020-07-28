import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator

from .models import User, Post

p = Paginator([], 10)

def index(request):
    return render(request, "network/index.html")

@csrf_exempt
def load_posts(request):
    global p
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    following =  int(data.get("following", ""))
    if following:
        if request.user.is_authenticated:
            following = request.user.following.all()
            posts = Post.objects.filter(onwer__in=following)
        else:
            return JsonResponse({"error": "No User signed."}, status=400)
    else:
        posts = Post.objects.all()
        posts = posts.order_by("timestamp").all()
    p = Paginator(posts, 10)
    return JsonResponse({"npages": p.count },  safe=False)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@csrf_exempt
@login_required
def create_post(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    body = data.get("body", "")

    p = Post(body = body, owner = request.user)
    p.save()

    return JsonResponse({"message": "Post was successful."}, status=201)

@csrf_exempt
def get_page(request):
    global p
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    page =  int(data.get("page", ""))

    try:
        posts = p.page(page)
    except EmptyPage:
        return JsonResponse({"error": "Not valid page"}, status=400)

    print(posts.object_list)
    posts_s = []
    for post in posts.object_list:
        print(post)
        post_s = post.serialize()
        if request.user.is_authenticated:
            if request.user in post.likes.all():
                post_s["liked"] = True
            if request.user == post.owner:
                post_s["owns"] = True
        posts_s.append(post_s)

    return JsonResponse(posts_s, safe=False)

@csrf_exempt
@login_required
def like_post(request, post_id):

    if request.method != "PUT":
        return JsonResponse({"error": "PUT request required."}, status=400)

    try:
        p = Post.objects.get(pk=post_id)
    except Email.DoesNotExist:
        return JsonResponse({"error": "Email not found."}, status=404)


    data = json.loads(request.body)
    if data["like"]:
        p.likes.add(request.user)
        p.save()
        return JsonResponse({"message": "Like added."}, status=201)
    else:
        p.likes.remove(request.user)
        p.save()
        return JsonResponse({"message": "Like removed."}, status=201)
