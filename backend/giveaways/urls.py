"""
URL routing for the giveaways and tools endpoints.
"""

from django.urls import path, re_path

from .views import (
    AdminLoginView,
    AdminWinnersView,
    CertificateVerifyView,
    GiveawayDetailView,
    GiveawayDrawView,
    GiveawayEntriesListView,
    GiveawayListCreateView,
    NuxtSaveGiveawayFinalView,
    NuxtSaveGiveawayView,
    NuxtSaveListView,
    NuxtStatsView,
    NuxtSubscriptionView,
    NuxtTokenView,
    NuxtTrackView,
    ToolCaptionGeneratorView,
    ToolCoinFlipView,
    ToolDiceRollView,
    ToolExcelWinnerView,
    ToolRandomNumberView,
)


urlpatterns = [
    path('giveaways/', GiveawayListCreateView.as_view(), name='giveaway-list-create'),
    path('giveaways/<int:pk>/', GiveawayDetailView.as_view(), name='giveaway-detail'),
    path('giveaways/<int:pk>/entries/', GiveawayEntriesListView.as_view(), name='giveaway-entries-list'),
    path('giveaways/<int:pk>/draw/', GiveawayDrawView.as_view(), name='giveaway-draw'),
    path('giveaways/verify/<str:certificate_code>/', CertificateVerifyView.as_view(), name='certificate-verify'),
    path('games/list-giveaways/save-list', NuxtSaveListView.as_view(), name='nuxt-save-list'),
    path('games/list-giveaways/save', NuxtSaveGiveawayView.as_view(), name='nuxt-save-giveaway'),
    path('games/list-giveaways/save-giveaway', NuxtSaveGiveawayFinalView.as_view(), name='nuxt-save-giveaway-final'),
    re_path(r'^token/?$', NuxtTokenView.as_view(), name='nuxt-token'),
    re_path(r'^stats/?$', NuxtStatsView.as_view(), name='nuxt-stats'),
    re_path(r'^account/subscription/?$', NuxtSubscriptionView.as_view(), name='nuxt-subscription'),
    re_path(r'^track(?:/.*)?$', NuxtTrackView.as_view(), name='nuxt-track'),
    path('tools/random-number/', ToolRandomNumberView.as_view(), name='tool-random-number'),
    path('tools/roll-dice/', ToolDiceRollView.as_view(), name='tool-roll-dice'),
    path('tools/flip-coin/', ToolCoinFlipView.as_view(), name='tool-flip-coin'),
    path('tools/caption-generator/', ToolCaptionGeneratorView.as_view(), name='tool-caption-generator'),
    path('tools/excel-winner/', ToolExcelWinnerView.as_view(), name='tool-excel-winner'),
    path('admin/login/', AdminLoginView.as_view(), name='admin-login'),
    path('admin/winners/', AdminWinnersView.as_view(), name='admin-winners'),
]
