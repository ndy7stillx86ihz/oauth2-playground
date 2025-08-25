from django.shortcuts import render, redirect
from django.http import JsonResponse
import requests
import base64
import hashlib
import json
import jwt

def authorization_code(request):
    """Handle authorization code flow"""
    context = {
        'title': 'Authorization Code Flow',
        'authorization_code': request.GET.get('code', ''),
        'state': request.GET.get('state', ''),
        'code_verifier': request.session.get('code_verifier', ''),
        'client_id': request.session.get('client_id', ''),
        'token_endpoint': request.session.get('token_endpoint', ''),
        'redirect_uri': request.session.get('redirect_uri', ''),
        'grant_type': request.session.get('grant_type', ''),
    }
    return render(request, 'authorization_code.html', context)

def token_view(request):
    """Display and decode JWT token"""
    access_token = request.session.get('access_token', '')
    refresh_token = request.session.get('refresh_token', '')
    userinfo_endpoint = request.session.get('userinfo_endpoint', '')

    decoded_token = None
    if access_token:
        try:
            # Decode JWT without verification (for playground purposes)
            decoded_token = jwt.decode(access_token, options={"verify_signature": False})
        except Exception as e:
            decoded_token = {'error': f'Failed to decode token: {str(e)}'}

    context = {
        'title': 'Token Information',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'decoded_token': decoded_token,
        'userinfo_endpoint': userinfo_endpoint,
        'has_userinfo': bool(userinfo_endpoint),
    }
    return render(request, 'token.html', context)


def logout(request):
    """Clear session and redirect to main page"""
    request.session.flush()
    return redirect('index')


def get_userinfo(request):
    """Fetch user information from userinfo endpoint"""
    access_token = request.session.get('access_token', '')
    userinfo_endpoint = request.session.get('userinfo_endpoint', '')

    if not access_token or not userinfo_endpoint:
        return JsonResponse({'error': 'Missing access token or userinfo endpoint'}, status=400)

    try:
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(userinfo_endpoint, headers=headers, timeout=10)
        response.raise_for_status()

        return JsonResponse({
            'success': True,
            'userinfo': response.json()
        })

    except requests.RequestException as e:
        return JsonResponse({'error': f'Failed to fetch userinfo: {str(e)}'}, status=400)
    except Exception as e:
        return JsonResponse({'error': f'Unexpected error: {str(e)}'}, status=500)


