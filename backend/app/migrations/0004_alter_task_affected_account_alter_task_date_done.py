# Generated by Django 4.2.3 on 2023-10-30 14:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0003_task'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='affected_account',
            field=models.ManyToManyField(null=True, to='app.agreements'),
        ),
        migrations.AlterField(
            model_name='task',
            name='date_done',
            field=models.DateField(blank=True, null=True),
        ),
    ]
