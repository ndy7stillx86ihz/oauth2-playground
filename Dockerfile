
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc curl \
    && rm -rf /var/lib/apt/lists/* \
#

RUN curl -LsSf https://astral.sh/uv/install.sh | sh

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen

COPY . .

RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

ENV DJANGO_SECRET_KEY=your-secret-key-here-change-in-production

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python manage.py check || exit 1

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
