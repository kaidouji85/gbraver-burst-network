FROM node:16
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN npm ci && npm run bootstrap && npm run build:serverless:match-make
CMD [ "npm", "run", "serve:serverless:match-make" ]
EXPOSE 3000