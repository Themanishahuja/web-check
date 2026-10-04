# Build from the repo root:  docker build -f apps/scanner/Dockerfile -t whc-scanner .
# The Playwright image ships Chromium and its system libraries.
FROM mcr.microsoft.com/playwright:v1.63.0-noble AS build
WORKDIR /repo
COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/scanner/package.json apps/scanner/
COPY packages/shared/package.json packages/shared/
RUN npm ci -w @whc/scanner -w @whc/shared --include-workspace-root
COPY packages/shared packages/shared
COPY apps/scanner apps/scanner
RUN npm run build -w @whc/scanner

FROM mcr.microsoft.com/playwright:v1.63.0-noble
WORKDIR /app
ENV NODE_ENV=production \
    BROWSER_NO_SANDBOX=true \
    TRUST_PROXY=true \
    PORT=4100
COPY --from=build /repo/node_modules ./node_modules
COPY --from=build /repo/apps/scanner/dist ./dist
COPY apps/scanner/package.json ./
EXPOSE 4100
# Run as the unprivileged user shipped with the image.
USER pwuser
CMD ["node", "dist/server.js"]
