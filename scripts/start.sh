#!/bin/sh
set -e
cd "$(dirname "$0")/.."

echo "Running database migrations..."
npx prisma migrate deploy

echo "Starting Rental Planner..."
exec npm start
