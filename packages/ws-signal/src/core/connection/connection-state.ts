import { z } from "zod";

import { None, NoneSchema } from "./none";
import { RoomHost, RoomHostSchema } from "./room-host";
import { Signaling, SignalingSchema } from "./signaling";

/** コネクションステート */
export type ConnectionState = None | RoomHost | Signaling;

/** ConnectionState zodスキーマ */
export const ConnectionStateSchema = z.union([
  NoneSchema,
  RoomHostSchema,
  SignalingSchema,
]);
