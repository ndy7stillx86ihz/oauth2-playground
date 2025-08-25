from abc import ABC

from playground.grant_types import OAuth2Client


class PublicOAuth2Client(OAuth2Client, ABC):
    def __init__(self, request):
        super().__init__(request)
