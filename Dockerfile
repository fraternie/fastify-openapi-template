FROM node:alpine

WORKDIR /app/api-template
RUN npm i -g openapi-typescript
COPY package.json ./
RUN yarn install
COPY ./ ./
RUN yarn run schema
RUN yarn run build

CMD ["yarn","start"]
