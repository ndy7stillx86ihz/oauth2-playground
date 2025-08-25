import abc

from playground.grant_types import OAuth2Client


class ConfidentialOAuth2Client(OAuth2Client, abc.ABC):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        self.client_secret = kwargs.get("client_secret")
