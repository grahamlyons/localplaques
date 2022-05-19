FROM node:18-slim AS base

WORKDIR /app/

COPY package.json package-lock.json ./

FROM base AS test

ENV NODE_ENV test

RUN npm install

CMD ["npm", "test"]

FROM base AS production

ENV NODE_ENV production

RUN npm install

CMD ["npm", "start"]
