from rest_framework import serializers as s

class DiscoveryEndpointResponseSerializer(s.Serializer):
    issuer = s.URLField()
    authorization_endpoint = s.URLField()
    token_endpoint = s.URLField()
    userinfo_endpoint = s.URLField()
    jwks_uri = s.URLField()
    revocation_endpoint = s.URLField()
    response_types_supported = s.ListField(child=s.CharField())
    id_token_signing_alg_values_supported = s.ListField(child=s.CharField())
    scopes_supported = s.ListField(child=s.CharField())
    claims_supported = s.ListField(child=s.CharField())
    code_challenge_methods_supported = s.ListField(child=s.CharField())
    grant_types_supported = s.ListField(child=s.CharField())
