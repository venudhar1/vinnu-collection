#!/bin/bash

# Pull changes, rebuild frontend, and restart Venu services on the VM

echo "Pulling latest changes from Git..."
git pull

echo "Rebuilding frontend..."
cd frontend
NODE_OPTIONS="--max-old-space-size=2048" npm run build
cd ..

echo "Stopping Venu services..."
echo "Stopping frontend..."
sudo systemctl stop venu-frontend
echo "Stopping backend..."
sudo systemctl stop venu-backend

echo "Starting Venu services..."
echo "Starting backend..."
sudo systemctl start venu-backend
echo "Starting frontend..."
sudo systemctl start venu-frontend

echo "Venu services updated and restarted successfully."
