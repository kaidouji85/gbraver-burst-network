import { ArmdozerId, ArmdozerIdSchema, PilotId, PilotIdSchema } from "gbraver-burst-core";
import { z } from "zod";

import { UserID, UserIDSchema } from "./user";
import { WSAPIGatewayConnectionId, WSAPIGatewayConnectionIdSchema } from "./ws-api-gateway-connection";

/** ルームID */
export type PrivateMatchRoomID = string;

/** PrivateMatchRoomID zodスキーマ */
export const PrivateMatchRoomIDSchema = z.string();

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

/** PrivateMatchRoom zodスキーマ */
export const PrivateMatchRoomSchema = z.object({
  roomID: PrivateMatchRoomIDSchema,
  owner: UserIDSchema,
  ownerConnectionId: WSAPIGatewayConnectionIdSchema,
  armdozerId: ArmdozerIdSchema,
  pilotId: PilotIdSchema,
});