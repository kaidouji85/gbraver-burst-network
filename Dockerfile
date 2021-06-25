FROM node:16.3.0-buster
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN npm ci && npm run bootstrap && npm run build:docker
CMD [ "npm", "run", "serve:monolithic-server-production" ]
EXPOSE 3000
