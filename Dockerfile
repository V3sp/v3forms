FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
RUN addgroup -S nodejs && adduser -S -G nodejs -s /bin/sh nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
RUN chown -R nextjs:nodejs /app/prisma
USER nextjs
EXPOSE 3000
ENV NODE_ENV=production
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
