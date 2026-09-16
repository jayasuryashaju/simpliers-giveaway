"""
Serializers for the Simpliers Giveaway clone.

Handles transformation, serialization, and validation of giveaways,
participant entries, and verification certificates.
"""

from typing import Any, Dict, List

from rest_framework import serializers

from .models import Giveaway, GiveawayEntry


class GiveawayEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for individual giveaway entries and winners.
    """

    class Meta:
        model = GiveawayEntry
        fields = [
            'id',
            'username',
            'avatar_url',
            'comment_text',
            'mentions_count',
            'is_winner',
            'is_substitute',
            'win_order',
            'created_at',
        ]
        read_only_fields = ['id', 'is_winner', 'is_substitute', 'win_order', 'created_at']


class GiveawaySerializer(serializers.ModelSerializer):
    """
    Detailed serializer for Giveaways including winners and stats.
    """

    winners = serializers.SerializerMethodField()
    substitutes = serializers.SerializerMethodField()

    class Meta:
        model = Giveaway
        fields = [
            'id',
            'title',
            'platform',
            'post_url',
            'account_username',
            'status',
            'winner_count',
            'substitute_count',
            'min_mentions',
            'keyword_filter',
            'allow_duplicates',
            'certificate_code',
            'verification_hash',
            'total_entries_count',
            'eligible_entries_count',
            'created_at',
            'drawn_at',
            'winners',
            'substitutes',
        ]
        read_only_fields = [
            'id',
            'certificate_code',
            'verification_hash',
            'status',
            'total_entries_count',
            'eligible_entries_count',
            'created_at',
            'drawn_at',
            'winners',
            'substitutes',
        ]

    def get_winners(self, obj: Giveaway) -> List[Dict[str, Any]]:
        """Return serialized list of selected winners."""
        winners = obj.entries.filter(is_winner=True).order_by('win_order')
        return GiveawayEntrySerializer(winners, many=True).data

    def get_substitutes(self, obj: Giveaway) -> List[Dict[str, Any]]:
        """Return serialized list of substitute (alternate) winners."""
        substitutes = obj.entries.filter(is_substitute=True).order_by('win_order')
        return GiveawayEntrySerializer(substitutes, many=True).data


class GiveawayCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for initializing a new giveaway with optional bulk or simulated entries.
    """

    raw_entries = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        write_only=True,
        help_text="Optional custom list of entry items [{username, comment_text, mentions_count, avatar_url}]",
    )
    generate_mock_entries = serializers.BooleanField(
        required=False,
        default=False,
        write_only=True,
        help_text="Whether to auto-generate realistic sample social entries if none provided.",
    )

    class Meta:
        model = Giveaway
        fields = [
            'id',
            'title',
            'platform',
            'post_url',
            'account_username',
            'winner_count',
            'substitute_count',
            'min_mentions',
            'keyword_filter',
            'allow_duplicates',
            'certificate_code',
            'raw_entries',
            'generate_mock_entries',
        ]
        read_only_fields = ['id', 'certificate_code']

    def create(self, validated_data: Dict[str, Any]) -> Giveaway:
        """Create the giveaway and ingest initial participant entries."""
        raw_entries = validated_data.pop('raw_entries', None)
        generate_mock = validated_data.pop('generate_mock_entries', False)

        giveaway = Giveaway.objects.create(**validated_data)

        if raw_entries:
            entry_objects = [
                GiveawayEntry(
                    giveaway=giveaway,
                    username=item.get('username', f'user_{i+1}'),
                    avatar_url=item.get('avatar_url', ''),
                    comment_text=item.get('comment_text', ''),
                    mentions_count=int(item.get('mentions_count', 0)),
                )
                for i, item in enumerate(raw_entries)
            ]
            GiveawayEntry.objects.bulk_create(entry_objects)
        elif generate_mock or giveaway.platform in ['instagram', 'twitter', 'youtube', 'facebook']:
            self._create_sample_entries(giveaway)

        giveaway.total_entries_count = giveaway.entries.count()
        giveaway.eligible_entries_count = len(giveaway.filter_eligible_entries())
        giveaway.save(update_fields=['total_entries_count', 'eligible_entries_count'])

        return giveaway

    def _create_sample_entries(self, giveaway: Giveaway) -> None:
        """Populate realistic sample social comments and mentions for demo and simulation."""
        sample_users = [
            ("sarah_designs", "I love this giveaway so much! Hoping to win! @emma_j @alex_k", 2),
            ("tech_marcus", "Great project! Entered. @dev_ryan @cloud_sam", 2),
            ("elena_rodriguez", "Pick me please! Good luck everyone @laura_m", 1),
            ("david_travels", "Count me in! Done all steps! @mike_v @travel_dan @sophia_b", 3),
            ("chloe_art", "This looks incredible! @jack_art", 1),
            ("liam_fitness", "Let's goooo! 🔥 Need this prize so bad! @noah_fit @gym_bro", 2),
            ("maya_creates", "Awesome giveaway! Shared to story as well @nina_99", 1),
            ("oliver_bakes", "Fingers crossed! 🤞 @lucas_chef @baker_kate", 2),
            ("zoe_fashion", "Amazing chance! Good luck to all participants @clara_style", 1),
            ("ethan_vlogs", "Awesome setup! Hope I get lucky today! @sammy_d", 1),
            ("amanda_read", "Count me in! Loving the community vibes ❤️ @books_rachel", 1),
            ("daniel_codes", "Solid build! Fingers crossed for the draw @byte_guy", 1),
            ("isabella_m", "Can't wait for results! @anna_p @bella_s", 2),
            ("ryan_gaming", "GG everyone! Let's get that W! @player_one @stream_dan", 2),
            ("hannah_nature", "Beautiful prize! Good luck all @green_thumb", 1),
        ]

        entry_objects = [
            GiveawayEntry(
                giveaway=giveaway,
                username=username,
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={username}",
                comment_text=comment,
                mentions_count=mentions,
            )
            for username, comment, mentions in sample_users
        ]
        GiveawayEntry.objects.bulk_create(entry_objects)


class CertificateVerificationSerializer(serializers.ModelSerializer):
    """
    Public authenticity serializer for verified giveaway certificates.
    """

    winners = serializers.SerializerMethodField()
    substitutes = serializers.SerializerMethodField()
    is_valid = serializers.SerializerMethodField()

    class Meta:
        model = Giveaway
        fields = [
            'certificate_code',
            'title',
            'platform',
            'post_url',
            'status',
            'verification_hash',
            'is_valid',
            'total_entries_count',
            'eligible_entries_count',
            'winner_count',
            'substitute_count',
            'min_mentions',
            'keyword_filter',
            'drawn_at',
            'winners',
            'substitutes',
        ]

    def get_winners(self, obj: Giveaway) -> List[Dict[str, Any]]:
        """Return list of verified winners."""
        winners = obj.entries.filter(is_winner=True).order_by('win_order')
        return GiveawayEntrySerializer(winners, many=True).data

    def get_substitutes(self, obj: Giveaway) -> List[Dict[str, Any]]:
        """Return list of verified substitutes."""
        substitutes = obj.entries.filter(is_substitute=True).order_by('win_order')
        return GiveawayEntrySerializer(substitutes, many=True).data

    def get_is_valid(self, obj: Giveaway) -> bool:
        """Confirm cryptographic validity of the certificate hash."""
        return bool(obj.status == 'completed' and obj.verification_hash and obj.drawn_at)
