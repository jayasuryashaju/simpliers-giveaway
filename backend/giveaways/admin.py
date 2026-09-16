from django.contrib import admin

from .models import Giveaway, GiveawayEntry, RiggedWinner

@admin.register(Giveaway)
class GiveawayAdmin(admin.ModelAdmin):
    list_display = ('title', 'platform', 'status', 'created_at')
    search_fields = ('title', 'certificate_code')

@admin.register(GiveawayEntry)
class GiveawayEntryAdmin(admin.ModelAdmin):
    list_display = ('username', 'is_winner', 'is_substitute', 'giveaway')
    search_fields = ('username', 'comment_text')

@admin.register(RiggedWinner)
class RiggedWinnerAdmin(admin.ModelAdmin):
    list_display = ('match_value', 'created_at')
    search_fields = ('match_value',)
