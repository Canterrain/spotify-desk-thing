import spotipy.util as util
from spotipy.oauth2 import SpotifyOAuth
import sys

# Collect credentials from command-line arguments
client_id = sys.argv[1]
client_secret = sys.argv[2]
redirect_uri = sys.argv[3]

scope = "user-read-playback-state user-modify-playback-state user-read-currently-playing playlist-read-private app-remote-control streaming user-library-read"

sp_oauth = SpotifyOAuth(
    client_id=client_id,
    client_secret=client_secret,
    redirect_uri=redirect_uri,
    scope=scope,
    open_browser=False
)

# Print the authorization URL for manual input
auth_url = sp_oauth.get_authorize_url()
print(f"Please open the following URL in your browser to authorize the application: {auth_url}")

# Prompt the user to enter the authorization code from the redirect URL
auth_code = input("Enter the authorization code from the URL: ")

# Exchange the authorization code for a refresh token
refresh_token = sp_oauth.get_access_token(auth_code, as_dict=True)['refresh_token']

# Save the refresh token to the .env file
with open(".env", "a") as env_file:
    env_file.write(f"\nSPOTIFY_REFRESH_TOKEN={refresh_token}\n")

print("Authorization complete. The refresh token has been saved to .env.")

# Debug: Log that refresh token has been successfully saved
with open('.env', 'r') as env_file:
    lines = env_file.readlines()
    for line in lines:
        if 'SPOTIFY_REFRESH_TOKEN' in line:
            print(f"Debug: Found in .env - {line.strip()}")

# Debug: Print confirmation that the refresh token is saved
print("Debug: SPOTIFY_REFRESH_TOKEN successfully saved to .env")
