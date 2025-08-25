import re

from django.views.generic import TemplateView
from django.core.cache import cache

grant_types = [
    ('authorization_code_with_pkce', 'Authorization Code (with PKCE)'),
    ('authorization_code', 'Authorization Code'),
    ('implicit', 'Implicit'),
    ('password', 'Password'),
    ('client_credentials', 'Client Credentials'),
    ('refresh_token', 'Refresh Token'),
]

class IndexView(TemplateView):
    template_name = 'index.html'
    extra_context = {
        'title': 'OAuth2 Playground',
        'grant_types': grant_types
    }

    def get_context_data(self, **kwargs):
        user_ip = self.request.META.get('REMOTE_ADDR')
        cache_key = f"discovery_config_{hash(user_ip)}"

        try:
            grant_types_supported = cache.get(cache_key).get("grant_types_supported")

            if grant_types_supported:
                self.extra_context['grant_types'] = [
                    gt
                    for gt in grant_types
                    for gts in grant_types_supported
                    if gts in gt[0]
                ]
        except AttributeError:
            pass

        return super().get_context_data(**kwargs)

