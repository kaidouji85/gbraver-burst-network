import type { ArmdozerId, PilotId } from "gbraver-burst-core";

import type { UserID } from "./user";
import type { WSAPIGatewayConnectionId } from "./ws-api-gateway-connection";

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
