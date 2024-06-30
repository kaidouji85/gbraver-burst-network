import { Amplify } from "aws-amplify";

/** 初期化パラメータ */
type InitializeParams = {
  /** Cognito ユーザープールID */
  userPoolId: "ap-northeast-1_H8IyJlPOQ";
  /** Cognito ユーザープール クライアントID */
  userPoolClientId: "2kofjo7m1l6c4f7te6gu4mb58m";
  /** Cognito Hosted UI ドメイン */
  hostedUIDomain: "kaidouji85-spa-test.auth.ap-northeast-1.amazoncognito.com";
  /** アプリケーションをホストしているURL（Hosted UI ログイン後のリダイレクトURL） */
  ownURL: "http://localhost:5173";
};

/**
 * ブラウザSDKの初期化を行う
 * 本関数はアプリケーション開始直後に１回だけ呼び出すこと
 * @param params 初期化パラメータ
 */
export function initialize(params: InitializeParams) {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: params.userPoolId,
        userPoolClientId: params.userPoolClientId,
        loginWith: {
          oauth: {
            domain: params.hostedUIDomain,
            scopes: [
              "openid",
              "email",
              "profile",
              "phone",
              "aws.cognito.signin.user.admin",
            ],
            redirectSignIn: [params.ownURL],
            redirectSignOut: [params.ownURL],
            responseType: "code",
          },
        },
      },
    },
  });
}
