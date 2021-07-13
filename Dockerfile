FROM node:alpine

WORKDIR /app/api-college
RUN npm i -g openapi-typescript
COPY package.json ./
RUN yarn install
COPY ./ ./
RUN yarn run schema

CMD ["yarn","dev"]
