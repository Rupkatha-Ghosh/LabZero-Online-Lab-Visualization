import os
import json
import secrets
import urllib.parse

import requests
from django.http import HttpResponseRedirect
from django.views import View
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI', 'http://localhost:8000/api/auth/google/callback/')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:3000')

GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'


class GoogleLoginView(View):
    """
    Step 1: Redirect the user to Google's consent screen.
    Stores the selected role in the OAuth 'state' parameter.
    """

    def get(self, request):
        role = request.GET.get('role', 'student')

        # Encode role + CSRF nonce into state
        state_data = json.dumps({'role': role, 'nonce': secrets.token_urlsafe(16)})
        state = urllib.parse.quote(state_data)

        # Store state in session for CSRF validation
        request.session['google_oauth_state'] = state_data

        params = {
            'client_id': GOOGLE_CLIENT_ID,
            'redirect_uri': GOOGLE_REDIRECT_URI,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'state': state,
            'prompt': 'select_account',
        }

        url = f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
        return HttpResponseRedirect(url)


class GoogleCallbackView(View):
    def get(self, request):
        code = request.GET.get('code')
        state_raw = request.GET.get('state', '{}')
        error = request.GET.get('error')

        # Handle errors from Google
        if error:
            return HttpResponseRedirect(f"{FRONTEND_URL}?auth_error={error}")

        if not code:
            return HttpResponseRedirect(f"{FRONTEND_URL}?auth_error=no_code")

        # Parse role from state
        try:
            state_data = json.loads(urllib.parse.unquote(state_raw))
            role = state_data.get('role', 'student')
        except (json.JSONDecodeError, TypeError):
            role = 'student'

        # Validate role (allow 'login' as a valid intent)
        if role not in ('student', 'teacher', 'institute', 'login'):
            role = 'student'

        # Exchange authorization code for tokens
        token_response = requests.post(GOOGLE_TOKEN_URL, data={
            'code': code,
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'redirect_uri': GOOGLE_REDIRECT_URI,
            'grant_type': 'authorization_code',
        })

        if token_response.status_code != 200:
            return HttpResponseRedirect(f"{FRONTEND_URL}?auth_error=token_exchange_failed")

        token_data = token_response.json()
        access_token = token_data.get('access_token')

        if not access_token:
            return HttpResponseRedirect(f"{FRONTEND_URL}?auth_error=no_access_token")

        # Fetch user info from Google
        userinfo_response = requests.get(
            GOOGLE_USERINFO_URL,
            headers={'Authorization': f'Bearer {access_token}'}
        )

        if userinfo_response.status_code != 200:
            return HttpResponseRedirect(f"{FRONTEND_URL}?auth_error=userinfo_failed")

        userinfo = userinfo_response.json()
        google_id = userinfo.get('id')
        email = userinfo.get('email')
        first_name = userinfo.get('given_name', '')
        last_name = userinfo.get('family_name', '')
        # picture = userinfo.get('picture', '')  # Available for future use

        if not email:
            return HttpResponseRedirect(f"{FRONTEND_URL}?auth_error=no_email")

        user = None

        try:
            user = User.objects.get(google_id=google_id)
        except User.DoesNotExist:
            pass

        if not user:
            try:
                user = User.objects.get(email=email)
                user.google_id = google_id
                user.save(update_fields=['google_id'])
            except User.DoesNotExist:
                pass

        if not user:
            if role == 'login':
                return HttpResponseRedirect(f"{FRONTEND_URL}?auth_error=account_not_found")

            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
                role=role,
                google_id=google_id,
            )

        refresh = RefreshToken.for_user(user)
        access_jwt = str(refresh.access_token)

        return HttpResponseRedirect(f"{FRONTEND_URL}?google_token={access_jwt}")
