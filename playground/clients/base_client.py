import re
from abc import ABC, abstractmethod
from django.conf import settings
from requests import Session

# abstract
class OAuth2Client(ABC):
    def __init__(self, name, **kwargs):
        self.name = name

        self.httpc = Session()
        self.httpc.verify = not settings.IGNORE_SSL_ERRORS

        self.server_url = kwargs.get('server_url')
        self.issuer_uri = kwargs.get('issuer_endpoint', '/oauth2/token')

        self.client_id = kwargs.get("client_id")

    @classmethod
    def get_name(cls):
        capitals_splitted_classname = re.findall(r'[A-Z][^A-Z]*', cls.__class__.__name__)

        return '_'.join(
            word.lower()
            for word in capitals_splitted_classname
        )

    @abstractmethod
    def get_token(self, **kwargs):
        pass
