# ─────────────────────────────────────────────────────────────────────────────
# AI Textile Waste Intelligence Platform — Frontend Dockerfile
# Uses Node 20 LTS (Alpine) for a lightweight Vite dev server container.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine

# Set working directory
WORKDIR /app

# ── Install dependencies ──────────────────────────────────────────────────────
# Copy package files first to leverage Docker layer cache:
# npm install only re-runs when package.json / package-lock.json change.
COPY package.json package-lock.json* ./
RUN npm install

# ── Copy application source ───────────────────────────────────────────────────
COPY . .

# ── Vite dev server port ──────────────────────────────────────────────────────
EXPOSE 5173

# ── Start Vite dev server ─────────────────────────────────────────────────────
# --host 0.0.0.0  → makes the server accessible outside the container
# --port 5173     → matches EXPOSE declaration
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
