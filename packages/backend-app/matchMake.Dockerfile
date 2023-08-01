# docker buildの前にbuild:match-makeを実行すること
FROM node:18.17.0-bullseye-slim
WORKDIR /usr/src/app
COPY ./ /usr/src/app
# SIGTERMを適切に処理できるように、
# あえてnpm run serve:match-make を使わないで、 
# nodeからスクリプトを直接起動している
CMD [ "node", ".webpack/match-making-polling.js" ]