FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /Task2/server

COPY package*.json ./

RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
