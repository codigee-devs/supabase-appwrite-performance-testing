FROM imbios/bun-node:latest

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --production

COPY . .

ENV NODE_ENV=production

CMD [ "bun", "dev" ]
EXPOSE 3000