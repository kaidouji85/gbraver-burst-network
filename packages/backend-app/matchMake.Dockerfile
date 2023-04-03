FROM node:16
WORKDIR /usr/src/app
COPY ./ /usr/src/app
CMD [ "npm", "run", "serve:match-make" ]