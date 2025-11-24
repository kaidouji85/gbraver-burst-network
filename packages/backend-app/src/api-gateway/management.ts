import { ApiGatewayManagementApi } from "@aws-sdk/client-apigatewaymanagementapi";

/**
 * APIゲートウェイ管理オブジェクトを生成するヘルパー関数
 *
 * @param endpoint APIゲートウェイのエンドポイント
 * @param useDualstackEndpoint AWS APIのデュアルスタックエンドポイントを使用するかどうか、falseであれば標準エンドポイントを使用する
 * @returns APIゲートウェイ管理オブジェクト
 */
export function createApiGatewayManagementApi(
  endpoint: string,
  useDualstackEndpoint = false,
): ApiGatewayManagementApi {
  return new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint,
    useDualstackEndpoint,
  });
}
