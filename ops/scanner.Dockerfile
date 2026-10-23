FROM node:22-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends clamav ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY scripts/ops/scan-documents.mjs scripts/ops/scan-documents.mjs
RUN mkdir -p /var/lib/clamav && chown -R node:node /var/lib/clamav
USER node
# A failed signature update fails the run rather than attesting with an absent scanner.
CMD ["sh", "-c", "freshclam --user=node --stdout && node scripts/ops/scan-documents.mjs"]
