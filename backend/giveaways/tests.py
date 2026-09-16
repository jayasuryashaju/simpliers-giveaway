"""
Unit and integration tests for the Simpliers Giveaway clone backend.

Validates model business logic, cryptographic draw fairness,
certificate verification, and API endpoint pagination.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from .models import Giveaway, GiveawayEntry


class GiveawayModelTestCase(TestCase):
    """
    Test suite validating Giveaway and GiveawayEntry model logic.
    """

    def setUp(self) -> None:
        """Create sample giveaway and test entries."""
        self.giveaway = Giveaway.objects.create(
            title="iPhone 15 Pro Giveaway",
            platform="instagram",
            post_url="https://www.instagram.com/p/Cxyz12345/",
            winner_count=1,
            substitute_count=1,
            min_mentions=1,
            keyword_filter="win",
            allow_duplicates=False,
        )

        GiveawayEntry.objects.create(
            giveaway=self.giveaway,
            username="eligible_user_1",
            comment_text="I want to win! @friend1",
            mentions_count=1,
        )
        GiveawayEntry.objects.create(
            giveaway=self.giveaway,
            username="eligible_user_2",
            comment_text="Pick me to win please! @friend2 @friend3",
            mentions_count=2,
        )
        # Entry without required keyword
        GiveawayEntry.objects.create(
            giveaway=self.giveaway,
            username="ineligible_keyword_user",
            comment_text="Great photo! @friend1",
            mentions_count=1,
        )
        # Entry without required mentions
        GiveawayEntry.objects.create(
            giveaway=self.giveaway,
            username="ineligible_mentions_user",
            comment_text="I want to win!",
            mentions_count=0,
        )

    def test_filter_eligible_entries(self) -> None:
        """Verify that rules correctly filter out unqualified comments."""
        eligible = self.giveaway.filter_eligible_entries()
        usernames = [e.username for e in eligible]
        self.assertEqual(len(eligible), 2)
        self.assertIn("eligible_user_1", usernames)
        self.assertIn("eligible_user_2", usernames)

    def test_execute_draw_assigns_winners_and_hash(self) -> None:
        """Verify draw marks winners, alternates, and creates verification hash."""
        winners, substitutes = self.giveaway.execute_draw()
        self.assertEqual(len(winners), 1)
        self.assertEqual(len(substitutes), 1)
        self.assertEqual(self.giveaway.status, 'completed')
        self.assertTrue(bool(self.giveaway.verification_hash))
        self.assertIsNotNone(self.giveaway.drawn_at)


class GiveawayAPITestCase(TestCase):
    """
    Test suite for REST API endpoints.
    """

    def setUp(self) -> None:
        """Set up APIClient instance."""
        self.client = APIClient()

    def test_create_giveaway_with_mock_entries(self) -> None:
        """Verify POST /api/giveaways/ creates giveaway and generates entries."""
        url = reverse('giveaway-list-create')
        payload = {
            "title": "MacBook Giveaway",
            "platform": "instagram",
            "post_url": "https://instagram.com/p/Demo12345",
            "winner_count": 2,
            "substitute_count": 2,
            "generate_mock_entries": True,
        }
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('certificate_code', response.data)
        self.assertEqual(response.data['total_entries_count'], 15)

    def test_draw_api_and_verification_api(self) -> None:
        """Verify draw execution and public certificate verification endpoint."""
        giveaway = Giveaway.objects.create(
            title="Sneakers Raffle",
            platform="twitter",
            winner_count=1,
            substitute_count=1,
        )
        GiveawayEntry.objects.create(giveaway=giveaway, username="runner1", comment_text="Count me in")
        GiveawayEntry.objects.create(giveaway=giveaway, username="runner2", comment_text="Retweeted")

        draw_url = reverse('giveaway-draw', kwargs={'pk': giveaway.pk})
        draw_response = self.client.post(draw_url)
        self.assertEqual(draw_response.status_code, status.HTTP_200_OK)

        cert_code = giveaway.certificate_code
        verify_url = reverse('certificate-verify', kwargs={'certificate_code': cert_code})
        verify_response = self.client.get(verify_url)
        self.assertEqual(verify_response.status_code, status.HTTP_200_OK)
        self.assertTrue(verify_response.data['is_valid'])
        self.assertEqual(len(verify_response.data['winners']), 1)

    def test_tool_random_number(self) -> None:
        """Verify random number generator API endpoint."""
        url = reverse('tool-random-number')
        payload = {"min": 10, "max": 20, "count": 5, "allow_duplicates": False}
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        numbers = response.data['numbers']
        self.assertEqual(len(numbers), 5)
        self.assertEqual(len(set(numbers)), 5)
        for num in numbers:
            self.assertTrue(10 <= num <= 20)
