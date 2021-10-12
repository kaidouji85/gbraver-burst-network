FROM node:16
WORKDIR /usr/src/app
COPY ./packages/backend-app /usr/src/app/
RUN npm ci && npm run build:match-make
CMD [ "npm", "run", "serve:match-make" ]
EXPOSE 3000