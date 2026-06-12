#!/bin/bash

# Restart Venu services on the VM (stops frontend first, then backend; starts backend first, then frontend)

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

echo "Venu services restarted successfully."
