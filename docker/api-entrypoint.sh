#!/bin/sh
set -e
cd /app/packages/database
npx prisma migrate deploy
cd /app/apps/api
node dist/main.js
