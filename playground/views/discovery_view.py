import json

import requests
from django.core.cache import cache
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR

from playground.serializers.discovery_endpoint_serializer import DiscoveryEndpointResponseSerializer


class DiscoveryAPIView(RetrieveAPIView):
    serializer_class = DiscoveryEndpointResponseSerializer

    def retrieve(self, request, *args, **kwargs):
        discovery_url = request.query_params.get('url')
        if not discovery_url:
            return Response({'error': 'url parameter is required'}, status=HTTP_400_BAD_REQUEST)

        user_ip = self.request.META.get('REMOTE_ADDR')
        cache_key = f"discovery_config_{hash(user_ip)}"

        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data, status=HTTP_200_OK)

        try:
            response = requests.get(discovery_url, timeout=15)
            response.raise_for_status()
            config = response.json()

            serializer = self.get_serializer(data=config)
            serializer.is_valid(raise_exception=True)



            return Response(serializer.validated_data, status=HTTP_200_OK)

        except requests.RequestException as e:
            return Response({'error': f'Failed to fetch discovery endpoint: {str(e)}'}, status=400)
        except json.JSONDecodeError:
            return Response({'error': 'Invalid JSON response from discovery endpoint'}, status=400)
        except Exception as e:
            return Response({'error': f'Unexpected error: {str(e)}'}, status=HTTP_500_INTERNAL_SERVER_ERROR)
