FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS deps
COPY pnpm-workspace.yaml package.json ./
COPY packages/types/package.json packages/types/package.json
COPY apps/web/package.json apps/web/package.json
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY packages/types packages/types
COPY apps/web apps/web
RUN pnpm --filter @maklerprogram/types build
RUN pnpm --filter web build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=build /repo/apps/web/.next /repo/apps/web/.next
COPY --from=build /repo/apps/web/public /repo/apps/web/public
COPY --from=build /repo/apps/web/package.json /repo/apps/web/package.json
COPY --from=build /repo/apps/web/next.config.mjs /repo/apps/web/next.config.mjs
COPY --from=build /repo/node_modules /repo/node_modules
COPY --from=build /repo/apps/web/node_modules /repo/apps/web/node_modules
WORKDIR /repo/apps/web
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
