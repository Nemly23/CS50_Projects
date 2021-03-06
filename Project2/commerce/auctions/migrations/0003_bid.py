# Generated by Django 3.0.8 on 2020-07-10 23:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0002_auto_20200710_2031'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bid',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('value', models.DecimalField(decimal_places=2, max_digits=11)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bid', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
