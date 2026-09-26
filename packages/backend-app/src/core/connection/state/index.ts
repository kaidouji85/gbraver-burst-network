import { z } from "zod";

import {
  CasualMatchMaking,
  CasualMatchMakingSchema,
} from "./casual-match-making";
import { HoldPrivateMatch, HoldPrivateMatchSchema } from "./hold-private-match";
import { InBattle, InBattleSchema } from "./in-battle";
import { None, NoneSchema } from "./none";
import {
  PrivateMatchMaking,
  PrivateMatchMakingSchema,
} from "./private-match-making";

/** コネクションの状態 */
export type ConnectionState =
  None | CasualMatchMaking | InBattle | HoldPrivateMatch | PrivateMatchMaking;

/** ConnectionState zodスキーマ */
export const ConnectionStateSchema = z.union([
  NoneSchema,
  CasualMatchMakingSchema,
  InBattleSchema,
  HoldPrivateMatchSchema,
  PrivateMatchMakingSchema,
]);
