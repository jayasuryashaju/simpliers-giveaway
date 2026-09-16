#!/usr/bin/env bash
# Render Build Script for Django Backend
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Collecting static assets..."
python manage.py collectstatic --noinput

echo "==> Running database migrations..."
python manage.py migrate

echo "==> Loading initial giveaway data..."
python manage.py loaddata giveaways/fixtures/initial_giveaways.json || echo "Initial data already loaded or skipped."

echo "==> Build completed successfully!"
