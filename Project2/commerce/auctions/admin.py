from django.contrib import admin
from django import forms
from django.db import models

from auctions.models import Auction, Category, Bid, Comment

# Register your models here.

class AuctionForm(forms.ModelForm):
    class Meta:
        model = Auction
        fields = ['title', 'image', 'description', 'bid', 'active', 'owner', 'category', 'comment']
        widgets = {
            'description': forms.Textarea(attrs={'cols': 100, 'rows': 5}),
        }
    comment = forms.ModelMultipleChoiceField(queryset= Comment.objects.all())

    def __init__(self, *args, **kwargs):
        super(AuctionForm, self).__init__(*args, **kwargs)
        self.fields['comment'].queryset = self.instance.comment.all()
        if self.instance:
            self.fields['comment'].initial = self.instance.comment.all()

    #def save(self, *args, **kwargs):
        # FIXME: 'commit' argument is not handled
        # TODO: Wrap reassignments into transaction
        # NOTE: Previously assigned Foos are silently reset
        #instance = super(AuctionForm, self).save(commit=False)
        #self.fields['comment'].initial.update(auction=None)
        #self.cleaned_data['comment'].update(auction=instance)
        #return instance


class AuctionAdmin(admin.ModelAdmin):
    form = AuctionForm


admin.site.register(Auction, AuctionAdmin)
admin.site.register(Category)
admin.site.register(Bid)
admin.site.register(Comment)
