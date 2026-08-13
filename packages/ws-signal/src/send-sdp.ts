import { APIGatewayProxyResultV2 } from "aws-lambda";

/**
 * SDPを相手に送信する
 * @returns レスポンス
 */
export const sendSDP = async (): Promise<APIGatewayProxyResultV2> => {
  return {
    statusCode: 200,
    body: "send sdp success",
  };
};
