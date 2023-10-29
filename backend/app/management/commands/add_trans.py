import datetime
from django.core.management.base import BaseCommand, CommandError
from app.models import Transactions


class Command(BaseCommand):
    help = "Custom testing"

    # def add_arguments(self, parser):
    #     parser.add_argument("poll_ids", nargs="+", type=int)

    def handle(self, *args, **options):
        objs = Transactions.objects.bulk_create(
            [
                Transactions(
                    transaction_id='00d4f3de-a3fc-4006-ab3b-b21f99c8848a:O2493', 
                    amount=-4.80,
                    value_date=datetime.datetime.now(datetime.timezone.utc),
                    description='KRAKOWZABKA Z6452 K.1PL',
                    balance_after=-468.85,
                    currency='PLN'
                    ),
                Transactions(
                    transaction_id='00d4f3de-a3fc-4006-ab3b-b21f99c8848a:ODDDD', 
                    amount=-4.80,
                    value_date=datetime.datetime.now(datetime.timezone.utc),
                    description='KRAKOWZABKA Z6452 K.1PL',
                    balance_after=-468.85,
                    currency='PLN'
                    ),
             ],
            ignore_conflicts=True
        )

        self.stdout.write(
            self.style.SUCCESS(objs)
        )