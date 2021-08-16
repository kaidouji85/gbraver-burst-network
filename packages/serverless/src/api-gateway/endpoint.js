// @flow

import type {HandlerEvent} from "../lambda/handler-event";

/**
 * eventからAPIゲートウェイのエンドポイントを生成する
 *
 * @param event イベント
 * @return APIゲートウェイのエンドポイント
 */
export function apiGatewayEndpoint(event: HandlerEvent): string {
  return `${event.requestContext.domainName}/${event.requestContext.stage}`;
}