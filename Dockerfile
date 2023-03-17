# front
FROM node:lts-alpine

RUN npm install pnpm -g

WORKDIR /app

COPY . /app

RUN pnpm install

RUN pnpm run builds

EXPOSE 80

CMD ["pnpm", "run", "prod"]
