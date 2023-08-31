import { ArmdozerId, PilotId } from "gbraver-burst-core";

import { UserID } from "./user";
import { WSAPIGatewayConnectionId } from "./ws-api-gateway-connection";

/** ルームID */
export type PrivateMatchRoomID = string;

/** プライベートマッチルーム */
export type PrivateMatchRoom = {
  /** ルームID */
  roomID: PrivateMatchRoomID;
  /** ルーム作成者 */
  owner: UserID;
  /** ルーム作成者のWebsocketAPIコネクションID */
  ownerConnectionId: WSAPIGatewayConnectionId;
  /** ルーム作成者が選択したアームドーザID */
  armdozerId: ArmdozerId;
  /** ルーム作成者が選択したパイロットID */
  pilotId: PilotId;
};
