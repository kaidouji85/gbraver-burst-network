import { z } from "zod";

import { None, NoneSchema } from "./none";

/** コネクションステート */
export type ConnectionState = None;

/** ConnectionState zodスキーマ */
export const ConnectionStateSchema = z.union([NoneSchema]);
