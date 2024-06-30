import { Amplify } from "aws-amplify";

/** 初期化パラメータ */
type InitializeParams = {
  /** Cognito ユーザープールID */
  userPoolId: string;
  /** Cognito ユーザープール クライアントID */
  userPoolClientId: string;
  /** Cognito Hosted UI ドメイン */
  hostedUIDomain: string;
  /** アプリケーションをホストしているURL（Hosted UI ログイン後のリダイレクトURL） */
  ownURL: string;
};

/**
 * ブラウザSDKの初期化を行う
 * 本関数はアプリケーション開始直後に１回だけ呼び出すこと
 * @param params 初期化パラメータ
 */
export function initializeBrowserSDK(params: InitializeParams) {
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
