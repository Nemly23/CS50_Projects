# Generated by Django 3.0.8 on 2020-07-11 01:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0005_auto_20200710_2102'),
    ]

    operations = [
        migrations.AddField(
            model_name='auction',
            name='active',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='auction',
            name='image',
            field=models.URLField(null=True),
        ),
    ]