FROM node:18-slim AS base

WORKDIR /app/

COPY package.json package-lock.json ./

FROM base AS test

ENV NODE_ENV test

RUN npm install

COPY . .

CMD ["npm", "test"]

FROM base AS build

ENV NODE_ENV development

RUN npm install

COPY . .

RUN npm run build

FROM base AS production

ENV NODE_ENV production

RUN npm install

COPY --from=build /app/dist ./dist

CMD ["npm", "start"]
