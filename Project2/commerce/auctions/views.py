from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required


from .models import User, Bid, Auction, Comment, Category


def index(request):
    auctions = Auction.objects.filter(active=True)
    return render(request, "auctions/index.html", {
        "auctions": auctions
    })


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
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")

@login_required
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
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")

@login_required
def createlist(request):
    categories = Category.objects.all()
    if request.method == "POST":
        title = request.POST["title"]
        image = request.POST["image"]
        description = request.POST["description"]
        bid = request.POST["bid"]
        add_category = request.POST.getlist("categories")
        try:
            b = Bid(value = bid, owner = request.user)
            b.save()
            a = Auction(title = title, image = image, description = description, owner = request.user, bid = b)
            a.save()
            for category in add_category:
                c = Category.objects.get(pk=category)
                a.category.add(c)
            a.save()
        except IntegrityError:
            return render(request, "auctions/createlist.html", {
                "message": "Auction already taken."
            })
        return redirect('index')
    else:
        return render(request, "auctions/createlist.html", {
            "categories": categories
        })

def listingpage(request, auction_key):
    auction = Auction.objects.get(pk=auction_key)
    comments = auction.comment.all()
    watch = request.user in auction.interested.all()
    if auction == None:
        raise Http404("Auction does not exist")
    if request.method == "POST":
        close = request.POST.get("close", False)
        if close:
            try:
                auction.active = False
                auction.save()
            except IntegrityError:
                return render(request, "auctions/listingpage.html", {
                    "auction": auction,
                    "invalid": True,
                    "watch": watch,
                    "comments": comments
                })
            return HttpResponseRedirect(request.path_info)
        comment = request.POST.get("comment", None)
        if comment != None:
            try:
                c = Comment(message = comment, owner = request.user, auction = auction)
                c.save()
            except IntegrityError:
                return render(request, "auctions/listingpage.html", {
                    "auction": auction,
                    "invalid": True,
                    "watch": watch
                })
            return HttpResponseRedirect(request.path_info)
        send = request.POST.get("send", False)
        watchlist = request.POST.get("watchlist", False)
        if send:
            if watchlist:
                print("add")
                auction.interested.add(request.user)
            else:
                print("removed")
                auction.interested.remove(request.user)
            return HttpResponseRedirect(request.path_info)
        else:
            bid = float(request.POST["bid"])
            if bid <= auction.bid.value:
                return render(request, "auctions/listingpage.html", {
                    "auction": auction,
                    "invalid": True,
                    "watch": watch
                })
            try:
                b = Bid(value = bid, owner = request.user)
                b.save()
                auction.bid = b
                auction.save()
            except IntegrityError:
                return render(request, "auctions/listingpage.html", {
                    "auction": auction,
                    "invalid": True,
                    "watch": watch
                })
            return HttpResponseRedirect(request.path_info)
    else:
        return render(request, "auctions/listingpage.html", {
            "auction": auction,
            "invalid": False,
            "watch": watch
        })

@login_required
def watchlist(request):
    auctions = request.user.watchlist.filter(active=True)
    return render(request, "auctions/index.html", {
        "auctions": auctions
    })

def categories(request, category_pk=0):
    categories = Category.objects.all()
    results = []
    category = None
    if category_pk > 0:
        category = Category.objects.get(pk=category_pk)
        results = category.auction.filter(active=True)
    return render(request, "auctions/categories.html", {
        "categories": categories,
        "search": category,
        "results": results
    })
