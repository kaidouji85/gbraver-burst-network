# docker buildの前にbuild:match-makeを実行すること
FROM node:18
WORKDIR /usr/src/app
COPY ./ /usr/src/app
# SIGTERMを適切に処理できるように、
# あえてnpm run serve:match-make を使わないで、 
# nodeからスクリプトを直接起動している
CMD [ "node", ".webpack/match-making-polling.js" ]
HEALTHCHECK --interval=5s --retries=2 CMD test -f match-make-health-check || exit 1