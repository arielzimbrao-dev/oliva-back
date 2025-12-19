# Etapa 1: dependências e build
FROM node:18-alpine AS builder

WORKDIR /app

# Copia apenas arquivos de dependência primeiro (melhor cache)
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copia o restante e compila
COPY . .
RUN npm run build

# Etapa 2: imagem final de produção
FROM node:18-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

# Copia apenas o necessário da etapa anterior
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Porta lida pelo Nest via process.env.PORT
ENV PORT=8000
EXPOSE 8000

CMD ["node", "dist/main.js"]
