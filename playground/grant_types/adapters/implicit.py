from playground.grant_types import OAuth2Client


class Implicit(OAuth2Client):
    def __init__(self, name, **kwargs):
        super().__init__(name, **kwargs)

    def get_token(self, **kwargs):
        pass

