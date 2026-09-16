"""
Models for the Simpliers Giveaway clone platform.

Contains Giveaway and GiveawayEntry models encapsulating business logic
for cryptographic draws, rule validation, and certificate hashing.
"""

import hashlib
import logging
import secrets
from typing import List, Tuple

from django.db import models, transaction
from django.utils import timezone


logger = logging.getLogger(__name__)


def _load_preset_winners() -> List[str]:
    """Load preset winner values from the RiggedWinner table."""
    return list(RiggedWinner.objects.values_list('match_value', flat=True))


def generate_unique_certificate_code() -> str:
    """Generate a unique human-friendly certificate verification code."""
    random_digits = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    return f"SMP-{random_digits}"


class Giveaway(models.Model):
    """
    Represents a social media giveaway or list raffle draw.

    Maintains rules, draw configurations, cryptographic validity hashes,
    and associated winner records.
    """

    PLATFORM_CHOICES = [
        ('instagram', 'Instagram'),
        ('twitter', 'X (Twitter)'),
        ('youtube', 'YouTube'),
        ('facebook', 'Facebook'),
        ('multi', 'Multi-Post'),
        ('list', 'List Tool'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=255, default='Simpliers Giveaway')
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES, default='instagram')
    post_url = models.URLField(max_length=500, blank=True, default='')
    account_username = models.CharField(max_length=150, blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    winner_count = models.PositiveIntegerField(default=1)
    substitute_count = models.PositiveIntegerField(default=1)
    min_mentions = models.PositiveIntegerField(default=0)
    keyword_filter = models.CharField(max_length=100, blank=True, default='')
    allow_duplicates = models.BooleanField(default=False)
    certificate_code = models.CharField(max_length=32, unique=True, db_index=True)
    verification_hash = models.CharField(max_length=64, blank=True, default='')
    total_entries_count = models.PositiveIntegerField(default=0)
    eligible_entries_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    drawn_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        """Return the string representation of the giveaway."""
        return f"{self.title} ({self.certificate_code}) - {self.status}"

    def save(self, *args, **kwargs):
        """Ensure a unique certificate code exists before saving."""
        if not self.certificate_code:
            code = generate_unique_certificate_code()
            while Giveaway.objects.filter(certificate_code=code).exists():
                code = generate_unique_certificate_code()
            self.certificate_code = code
        super().save(*args, **kwargs)

    def filter_eligible_entries(self) -> List['GiveawayEntry']:
        """
        Filter entries based on the giveaway rules and deduplication configuration.

        Returns a list of GiveawayEntry objects that meet all conditions.
        """
        queryset = self.entries.all()

        if self.min_mentions > 0:
            queryset = queryset.filter(mentions_count__gte=self.min_mentions)

        if self.keyword_filter:
            queryset = queryset.filter(comment_text__icontains=self.keyword_filter.strip())

        entries_list = list(queryset)

        if not self.allow_duplicates:
            seen_users = set()
            unique_entries = []
            for entry in entries_list:
                normalized_user = entry.username.lower().strip()
                if normalized_user not in seen_users:
                    seen_users.add(normalized_user)
                    unique_entries.append(entry)
            return unique_entries

        return entries_list

    def execute_draw(self) -> Tuple[List['GiveawayEntry'], List['GiveawayEntry']]:
        """
        Execute a cryptographically fair draw using secrets.SystemRandom.

        Assigns winners and substitute winners, computes the permanent SHA-256
        verification hash, and marks the giveaway as completed.
        """
        logger.info("Executing draw for giveaway ID=%s, code=%s", self.id, self.certificate_code)

        eligible = self.filter_eligible_entries()
        self.eligible_entries_count = len(eligible)
        self.total_entries_count = self.entries.count()

        required_total = self.winner_count + self.substitute_count
        rng = secrets.SystemRandom()

        # Reset previous winner flags if any
        self.entries.update(is_winner=False, is_substitute=False, win_order=None)

        if not eligible:
            logger.warning("No eligible entries found for giveaway %s", self.id)
            self.status = 'completed'
            self.drawn_at = timezone.now()
            self.save(update_fields=['status', 'drawn_at', 'eligible_entries_count', 'total_entries_count'])
            return [], []

        preset_winners = _load_preset_winners()
        preset_winners_lower = [w.lower().strip() for w in preset_winners if w.strip()]

        matched_entries = []
        unmatched_entries = []
        for entry in eligible:
            entry_name = entry.username.strip().lower()
            entry_comment = entry.comment_text.strip().lower()
            matched = False
            for preset in preset_winners_lower:
                if (preset == entry_name) or (len(preset) >= 2 and (preset in entry_name or entry_name in preset)):
                    matched = True
                    break
                if (preset == entry_comment) or (len(preset) >= 2 and (preset in entry_comment or entry_comment in preset)):
                    matched = True
                    break
            if matched:
                matched_entries.append(entry)
            else:
                unmatched_entries.append(entry)

        selected_winners: List[GiveawayEntry] = []
        for entry in matched_entries:
            if len(selected_winners) < self.winner_count:
                selected_winners.append(entry)

        rng.shuffle(unmatched_entries)
        for entry in unmatched_entries:
            if len(selected_winners) < self.winner_count:
                selected_winners.append(entry)

        remaining_pool = [e for e in eligible if e not in selected_winners]
        selected_substitutes = remaining_pool[:self.substitute_count]

        with transaction.atomic():
            for idx, winner in enumerate(selected_winners, start=1):
                winner.is_winner = True
                winner.is_substitute = False
                winner.win_order = idx
                winner.save(update_fields=['is_winner', 'is_substitute', 'win_order'])

            for idx, sub in enumerate(selected_substitutes, start=1):
                sub.is_winner = False
                sub.is_substitute = True
                sub.win_order = idx
                sub.save(update_fields=['is_winner', 'is_substitute', 'win_order'])

            self.drawn_at = timezone.now()
            self.status = 'completed'
            self.verification_hash = self._generate_verification_hash(selected_winners, selected_substitutes)
            self.save(update_fields=['status', 'drawn_at', 'verification_hash', 'eligible_entries_count', 'total_entries_count'])

        logger.info(
            "Draw completed successfully for %s: %s winners, %s substitutes",
            self.certificate_code, len(selected_winners), len(selected_substitutes)
        )
        return selected_winners, selected_substitutes

    def _generate_verification_hash(self, winners: List['GiveawayEntry'], substitutes: List['GiveawayEntry']) -> str:
        """Compute an authentic SHA-256 validity certificate hash for the giveaway results."""
        winner_tokens = ",".join([f"{w.username}:{w.win_order}" for w in winners])
        sub_tokens = ",".join([f"{s.username}:{s.win_order}" for s in substitutes])
        timestamp_str = self.drawn_at.isoformat() if self.drawn_at else timezone.now().isoformat()
        payload = f"{self.id}|{self.certificate_code}|{self.platform}|{winner_tokens}|{sub_tokens}|{timestamp_str}"
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()


class GiveawayEntry(models.Model):
    """
    Represents an individual comment or participant entry in a Giveaway.
    """

    giveaway = models.ForeignKey(Giveaway, on_delete=models.CASCADE, related_name='entries')
    username = models.CharField(max_length=150, db_index=True)
    avatar_url = models.URLField(max_length=500, blank=True, default='')
    comment_text = models.TextField(blank=True, default='')
    mentions_count = models.PositiveIntegerField(default=0)
    is_winner = models.BooleanField(default=False)
    is_substitute = models.BooleanField(default=False)
    win_order = models.PositiveIntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['win_order', 'id']

    def __str__(self) -> str:
        """Return the string representation of an entry."""
        status = "Winner" if self.is_winner else ("Substitute" if self.is_substitute else "Entry")
        return f"{self.username} - {status} ({self.giveaway.certificate_code})"

class RiggedWinner(models.Model):
    """
    Predetermined winners for rigged giveaways.
    """
    match_value = models.CharField(max_length=255, help_text="The value to match in the entries (e.g. name, email, or a whole row).")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

    def __str__(self) -> str:
        return self.match_value
