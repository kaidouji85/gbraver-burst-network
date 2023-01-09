/** JWTクレーム */
export type JwtClaims = {
  aud: string;
  azp: string;
  exp: string;
  iat: string;
  iss: string;
  scope: string;
  sub: string;
};

/** RestAPIのリクエストコンテキスト */
export type RestAPIRequestContext = {
  authorizer: {
    jwt: {
      claims: JwtClaims;
    };
  };
};

/** RestAPIのイベント */
export type RestAPIEvent = {
  /** リクエストコンテキスト */
  requestContext: RestAPIRequestContext;
};
