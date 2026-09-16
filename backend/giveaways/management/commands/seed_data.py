"""
Management command to seed realistic demo giveaways and certificates.
"""

import logging

from django.core.management.base import BaseCommand

from giveaways.models import Giveaway, GiveawayEntry


logger = logging.getLogger(__name__)


class Command(BaseCommand):
    """
    Seeds initial verified and pending giveaways for demonstration.
    """

    help = "Seeds demo giveaways, participants, and verified certificates."

    def handle(self, *args, **options) -> None:
        """Execute database seeding."""
        self.stdout.write("Seeding demo giveaways...")

        if Giveaway.objects.exists():
            self.stdout.write("Giveaways already exist. Skipping seed.")
            return

        # 1. Official Simpliers Global Community iPhone Giveaway
        g1 = Giveaway.objects.create(
            title="Summer Community iPhone 15 Pro Giveaway",
            platform="instagram",
            post_url="https://www.instagram.com/p/C-simpliers2026/",
            account_username="simpliers",
            winner_count=2,
            substitute_count=2,
            min_mentions=2,
            keyword_filter="love",
            allow_duplicates=False,
            certificate_code="SMP-772910",
        )

        sample_participants = [
            ("emma.design", "I love this community so much! @olivia @lucas", 2),
            ("marcus_tech", "Such a great initiative, love the prizes! @jake @ryan", 2),
            ("sophia_art", "Count me in! I would love to win this ✨ @chloe @mia", 2),
            ("liam_runner", "Let's go! I love tech giveaways @sam @alex", 2),
            ("isabella.reads", "Amazing! Love from NYC ❤️ @grace @ava", 2),
            ("noah_nature", "Super excited! Love the Simpliers platform @ethan @oliver", 2),
            ("zoe_codes", "fingers crossed, love you guys @elena @david", 2),
            ("daniel_photo", "Love this capture! Best of luck everyone @ben @leo", 2),
        ]

        for user, comment, mentions in sample_participants:
            GiveawayEntry.objects.create(
                giveaway=g1,
                username=user,
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user}",
                comment_text=comment,
                mentions_count=mentions,
            )

        g1.execute_draw()

        # 2. X (Twitter) Tech Founders Raffle
        g2 = Giveaway.objects.create(
            title="Tech Founders 4K Monitor Giveaway",
            platform="twitter",
            post_url="https://x.com/techfeed/status/179283401",
            account_username="techfeed",
            winner_count=1,
            substitute_count=1,
            min_mentions=0,
            certificate_code="SMP-491028",
        )

        for user in ["build_fast", "dev_alex", "crypto_kai", "sarah_ai"]:
            GiveawayEntry.objects.create(
                giveaway=g2,
                username=user,
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user}",
                comment_text="Retweeted and followed!",
                mentions_count=0,
            )

        g2.execute_draw()

        self.stdout.write(self.style.SUCCESS("Successfully seeded demo giveaways and certificates!"))
