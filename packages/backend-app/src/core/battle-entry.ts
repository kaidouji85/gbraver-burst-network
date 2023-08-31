import {
  ArmdozerId,
  ArmdozerIdSchema,
  PilotId,
  PilotIdSchema,
} from "gbraver-burst-core";
import { z } from "zod";

import { UserID, UserIDSchema } from "./user";
import {
  WSAPIGatewayConnectionId,
  WSAPIGatewayConnectionIdSchema,
} from "./ws-api-gateway-connection";

/**
 * ネット対戦エントリ
 * カジュアルマッチ、プライベートマッチ等、全ケースのエントリで
 * 必要最小限の情報をあつめた
 */
export type BattleEntry = {
  /** エントリーするユーザのID */
  userID: UserID;
  /** 選択したアームドーザID */
  armdozerId: ArmdozerId;
  /** 選択したパイロットID */
  pilotId: PilotId;
  /** コネクションID */
  connectionId: WSAPIGatewayConnectionId;
};

/** BattleEntry zodスキーマ */
export const BattleEntrySchema = z.object({
  userID: UserIDSchema,
  armdozerId: ArmdozerIdSchema,
  pilotId: PilotIdSchema,
  connectionId: WSAPIGatewayConnectionIdSchema,
});
