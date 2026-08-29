# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Base Python image
# Python 3.11-slim keeps the image small while remaining fully compatible
# with TensorFlow, FastAPI, and all project dependencies.
# ─────────────────────────────────────────────────────────────────────────────
FROM python:3.11-slim

# Set working directory inside the container
WORKDIR /app

# ── System dependencies ───────────────────────────────────────────────────────
# libpq-dev   → required by psycopg2-binary (PostgreSQL driver)
# build-essential → needed for compiling native Python extensions
RUN apt-get update && apt-get install -y \
    libpq-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# ── Python dependencies ───────────────────────────────────────────────────────
# Copy requirements first to leverage Docker layer cache:
# dependencies only reinstall when requirements.txt changes.
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir tensorflow pillow numpy

# ── Application source code ───────────────────────────────────────────────────
COPY . .

# ── AI Model files ────────────────────────────────────────────────────────────
# Models are now copied directly from the local backend/models/ directory
COPY --chown=root:root models/material_classifier.h5  /models/material_classifier.h5
COPY --chown=root:root models/condition_classifier.h5 /models/condition_classifier.h5

# ── Environment ───────────────────────────────────────────────────────────────
# Disable Python output buffering so logs appear in real-time in Docker
ENV PYTHONUNBUFFERED=1

# FastAPI listens on 8000
EXPOSE 8000

# ── Startup command ───────────────────────────────────────────────────────────
# --host 0.0.0.0  → binds to all interfaces (required inside Docker)
# --port 8000     → matches EXPOSE declaration
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]