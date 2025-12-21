# Etapa 1: dependências e build
FROM node:18-alpine AS builder

WORKDIR /app

# Copia apenas arquivos de dependência primeiro (melhor cache)
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

# Copia tsconfig e src para build
COPY tsconfig*.json ./
COPY src/ ./src/
RUN npm run build

# Etapa 2: imagem final de produção (ENXUTA)
FROM node:18-alpine AS production

WORKDIR /app

# Configurações de produção
ENV NODE_ENV=production
ENV PORT=3000

# Instala apenas produção (sem devDependencies)
COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps && npm cache clean --force

# Copia apenas dist (buildado) e package.json
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Cria usuário não-root (segurança)
RUN addgroup --gid 1001 nodejs && \
    adduser --uid 1001 --ingroup nodejs nestjs && \
    chown -R nestjs:nodejs /app
USER nestjs

EXPOSE ${PORT}
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1

CMD ["node", "dist/main.js"]
