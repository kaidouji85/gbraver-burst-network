/**
 * Websocket API Gatewayのエンドポイントを生成する
 *
 * @param apiID API ID
 * @param region AWSのリージョン
 * @param stage API Gatewayのステージ
 * @return 生成結果
 */
export function createAPIGatewayEndpoint(
  apiID: string,
  region: string,
  stage: string,
): string {
  return `https://${apiID}.execute-api.${region}.amazonaws.com/${stage}`;
}
