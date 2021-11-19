module.exports = {
    parser: "@babel/eslint-parser",
    env: {
        browser: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:flowtype/recommended"
    ],
    plugins: [
        "flowtype"
    ]
};
