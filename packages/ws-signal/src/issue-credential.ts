import crypto from "crypto";
import type { APIGatewayProxyEventV2, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResult> => {
  const body = event.body ? JSON.parse(event.body) : {};
  const username = `user_${Date.now()}`;
  const password = crypto.randomBytes(16).toString("base64url");
  const ttl = typeof body?.duration === "number" ? body.duration : 3600;

  return {
    statusCode: 201,
    headers: {
      "Content-Type": "application/json",
      "Location": `/coturn/credentials/${username}`,
    },
    body: JSON.stringify({ username, password, ttl }),
  };
};
