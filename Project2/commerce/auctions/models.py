from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    pass

class Category(models.Model):
    name = models.CharField(max_length=64)
    def __str__(self):
      return f"${self.name}"

class Bid(models.Model):
    value = models.DecimalField(max_digits=11, decimal_places=2)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bid")
    def __str__(self):
      return f"${self.value} from {self.owner}"

class Auction(models.Model):
    title = models.CharField(max_length=64)
    description = models.CharField(max_length=480)
    active = models.BooleanField(default = True)
    image =models.URLField(null = True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="auction")
    interested = models.ManyToManyField(User, blank=True, related_name="watchlist")
    category = models.ManyToManyField(Category, blank=True, related_name="auction")
    bid = models.ForeignKey(Bid, on_delete=models.CASCADE, related_name="auction")
    def __str__(self):
      return f"{self.title} \n{self.description} \nBid: {self.bid}"

class Comment(models.Model):
    message = models.CharField(max_length=64)
    date = models.DateField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comment")
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="comment")
    def __str__(self):
      return f"Comment of {self.owner} on {self.date} \n{self.message}"
