# Production Dockerfile for OceanGuard AI - SIH26143
FROM python:3.10-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy codebase
COPY . .

# Expose FastAPI & Static Port
EXPOSE 8000

ENV HOST=0.0.0.0
ENV PORT=8000
ENV ENVIRONMENT=production

# Start FastAPI server
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
