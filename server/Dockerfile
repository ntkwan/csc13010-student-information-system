FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Disable Corepack integrity check
ENV COREPACK_INTEGRITY_KEYS=0

WORKDIR /server

COPY package*.json ./

RUN pnpm install

RUN pnpm rebuild bcrypt

COPY . .

RUN pnpm run build

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
