#!/usr/bin/env sh

if [ -f /replicated.txt ]; then
  echo "Mongo is already set up"
else
  echo "Setting up mongo replication and seeding initial data..."
  sleep 10s
  mongo mongo0:27017 replicate.js
  echo "Replication done..."
  # Wait for few seconds until replication takes effect
  touch /replicated.txt
fi