import {
  ArmdozerId,
  ArmdozerIdSchema,
  PilotId,
  PilotIdSchema,
} from "gbraver-burst-core";
import { z } from "zod";

/**
 * 入室イベント
 * @description Socket.IOの'enterRoom'イベントで送信されるデータ
 */
export type EnterRoomEvent = {
  /** アームドーザID */
  armdozerId: ArmdozerId;
  /** パイロットID */
  pilotId: PilotId;
};

/**
 * 入室イベントのzodスキーマ
 * @description Socket.IOの'enterRoom'イベントのバリデーション用スキーマ
 */
export const EnterRoomEventSchema = z.object({
  /** アームドーザID */
  armdozerId: ArmdozerIdSchema,
  /** パイロットID */
  pilotId: PilotIdSchema,
});
