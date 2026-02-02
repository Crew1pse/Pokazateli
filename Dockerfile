FROM node:18

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --production # Ставим только нужные пакеты

COPY . .

RUN mkdir -p public/uploads && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "index.js"]