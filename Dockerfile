FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY services/api/package.json services/api/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --ignore-scripts
COPY . .
RUN npm run db:generate && npm run build
ENV NODE_ENV=production HOST=0.0.0.0 PORT=5000
EXPOSE 5000
USER node
CMD ["sh", "-c", "npm run db:migrate && npm run start --workspace @newsdc/api"]
