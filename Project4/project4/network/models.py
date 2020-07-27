from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    followers = models.ManyToManyField("self", symmetrical=False, blank=True, related_name="following")

    def __str__(self):
      return f"{self.username}"

class Post(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    timestamp = models.DateTimeField(auto_now_add=True)
    body = models.CharField(max_length=240)
    likes = models.ManyToManyField(User, blank=True, related_name="liked")

    def number_likes(self):
        return self.likes.count()

    def __str__(self):
      return f"Post by {self.owner} at " + self.timestamp.strftime("%b %d %Y, %I:%M %p")

    def serialize(self):
        return {
            "id": self.id,
            "owner": self.owner.username,
            "body": self.body,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.number_likes(),
            "liked": False,
            "owns": False
        }
