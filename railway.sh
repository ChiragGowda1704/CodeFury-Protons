#!/usr/bin/env bash
# Railway deployment script

echo "Starting deployment..."

# Install backend dependencies
cd backend
pip install -r requirements.txt

echo "Backend dependencies installed successfully!"
