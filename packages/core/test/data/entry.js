// @flow

import type {Entry} from "../../src/waiting-room/entry";
import {ArmDozerIdList, PilotIds} from "gbraver-burst-core";

/** 空のエントリ */
export const EMPTY_ENTRY: Entry = {
  sessionID: 'emptySession',
  armdozerId: ArmDozerIdList.SHIN_BRAVER,
  pilotId: PilotIds.SHINYA
};