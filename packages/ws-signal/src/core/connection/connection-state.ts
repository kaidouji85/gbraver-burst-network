import { z } from "zod";

import { None, NoneSchema } from "./none";
import { RoomHost, RoomHostSchema } from "./room-host";

/** コネクションステート */
export type ConnectionState = None | RoomHost;

/** ConnectionState zodスキーマ */
export const ConnectionStateSchema = z.union([NoneSchema, RoomHostSchema]);
