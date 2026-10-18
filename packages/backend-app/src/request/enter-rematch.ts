import { ArmdozerId, PilotId } from "gbraver-burst-core";
import { z } from "zod";

import {
  RematchRoomID,
  RematchRoomIDSchema,
} from "../core/matching/rematch/rematch-room";

/** 再戦ルームにエントリ */
export type EnterRematch = {
  action: "enter-rematch";
  /** ルームID */
  roomID: RematchRoomID;
  /** 選択したアームドーザID */
  armdozerId: ArmdozerId;
  /** 選択したパイロットID */
  pilotId: PilotId;
};

/** EnterRematch Zod スキーマ */
export const EnterRematchSchema = z.object({
  action: z.literal("enter-rematch"),
  roomID: RematchRoomIDSchema,
  armdozerId: z.string(),
  pilotId: z.string(),
});
