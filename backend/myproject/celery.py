import os
from datetime import timedelta

from celery import Celery
from celery.schedules import crontab


# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "myproject.settings")

app = Celery("myproject")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.conf.enable_utc = False

app.conf.update(timezone="Europe/Warsaw")

app.config_from_object("django.conf:settings", namespace="CELERY")

app.conf.broker_url = "redis://localhost:6379/0"

app.conf.broker_transport_options = {"visibility_timeout": 3600}

# Celery Beat Settings

app.conf.beat_schedule = {
    # "add-print": {
    #     "task": "app.tasks.add",
    #     "schedule": crontab(),
    # },
    "fetch-transactions-data": {
        "task": "app.tasks.fetch_transactions_data",
        "schedule": crontab(minute="*/10"),
    },
}

app.autodiscover_tasks()


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
