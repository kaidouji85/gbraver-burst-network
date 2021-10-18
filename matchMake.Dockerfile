FROM node:16
WORKDIR /usr/src/app
COPY ./packages/backend-app /usr/src/app/
RUN npm ci && npm run transpile:match-make
CMD [ "npm", "run", "serve:match-make" ]