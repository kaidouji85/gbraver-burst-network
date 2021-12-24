FROM node:16 AS builder
WORKDIR /usr/src/app
COPY ./ /usr/src/app/
RUN npm ci && npm run bootstrap && npm run build

FROM node:16
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/packages/backend-app ./
CMD [ "npm", "run", "serve:match-make" ]