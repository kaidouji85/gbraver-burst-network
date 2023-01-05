import { ApiGatewayManagementApi } from "aws-sdk";

/**
 * APIゲートウェイ管理オブジェクトを生成するヘルパー関数
 *
 * @param endpoint APIゲートウェイのエンドポイント
 * @return APIゲートウェイ管理オブジェクト
 */
export function createApiGatewayManagementApi(
  endpoint: string
): ApiGatewayManagementApi {
  return new ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint,
  });
}
