# Generated by Django 4.2.3 on 2023-10-29 18:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='account',
            name='agreements',
        ),
        migrations.RemoveField(
            model_name='account',
            name='transactions',
        ),
        migrations.RemoveField(
            model_name='transactions',
            name='agreement',
        ),
        migrations.AddField(
            model_name='agreements',
            name='account',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='app.account'),
        ),
        migrations.AddField(
            model_name='transactions',
            name='account',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='app.account'),
        ),
    ]