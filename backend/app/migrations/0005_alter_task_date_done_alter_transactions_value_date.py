# Generated by Django 4.2.3 on 2023-10-31 17:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0004_alter_task_affected_account_alter_task_date_done'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='date_done',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='transactions',
            name='value_date',
            field=models.DateField(),
        ),
    ]
