/** Rest APIが返すレスポンス */
export type RestAPIResponse = {
  /** ステータスコード */
  statusCode: number;

  /** レスポンスボディ */
  body: string;
};
