#!/bin/bash

# Update the system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
sudo npm install -g pnpm

# Clone the Spotify Desk Thing repository
git clone https://github.com/Canterrain/spotify-desk-thing.git
cd spotify-desk-thing

# Install dependencies
pnpm install

# Collect Spotify Developer credentials
echo "Enter your Spotify Client ID:"
read SPOTIFY_CLIENT_ID
echo "Enter your Spotify Client Secret:"
read SPOTIFY_CLIENT_SECRET

# Configure redirect URIs
REDIRECT_URI="http://localhost:8000/callback"

# Create environment file
# Create a new environment file
rm -f .env

# Add new environment variables to .env file
cat <<EOT > .env
SPOTIFY_CLIENT_ID=$SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET=$SPOTIFY_CLIENT_SECRET
SPOTIFY_REDIRECT_URI=$REDIRECT_URI
EOT

# Install Python and necessary libraries
sudo apt install -y python3 python3-pip

# Create a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install spotipy within the virtual environment
pip install spotipy

# Log installed Python packages to verify installation success
pip freeze > python_packages_debug.log

# Run the generate_token.py script to authenticate with Spotify and generate Refresh Token
python python/generate_token.py $SPOTIFY_CLIENT_ID $SPOTIFY_CLIENT_SECRET $REDIRECT_URI

# Stop the server if it's running
kill $(pgrep -f 'node.*spotify-desk-thing') || true

# Wait a few seconds to ensure the server stops completely
sleep 5

# Build the Application
pnpm build

# Start the Production Server after generating the token
pnpm start &

# Log environment variables to verify they are being loaded
printenv | grep SPOTIFY > env_debug.log

# Wait a few seconds to ensure the server starts
sleep 5

echo "Please manually open a browser and navigate to http://localhost:3000 to access the application."

# Clean up
echo "
Setup is complete. The server has been started and the application is now open in your browser."
