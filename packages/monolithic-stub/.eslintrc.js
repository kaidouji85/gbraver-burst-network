module.exports = {
    env: {
        browser: true
    },
    extends: [
        "eslint:recommended",
        "plugin:flowtype/recommended"
    ],
    plugins: [
        "flowtype"
    ],
    globals: {
        // webpack.config.js Webpack Define Pluginで定義したグローバル変数
        API_SERVER_URL: true,
        USER_ID_1: true,
        PASSWORD_1: true,
        USER_ID_2: true,
        PASSWORD_2: true,
        INVALID_USER_ID: true,
        INVALID_PASSWORD: true,
    }
};
