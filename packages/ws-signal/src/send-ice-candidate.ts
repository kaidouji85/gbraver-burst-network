import { APIGatewayProxyResultV2 } from "aws-lambda";

/**
 * ICE Candidateを相手に送信する
 * @returns レスポンス
 */
export const sendICECandidate = async (): Promise<APIGatewayProxyResultV2> => {
  return { statusCode: 200, body: "send ice candidate success" };
};
