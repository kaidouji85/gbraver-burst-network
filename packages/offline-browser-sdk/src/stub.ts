import { ArmdozerIds, PilotIds } from "gbraver-burst-core";

import { createOfflineBrowserSDK } from "./";

/** バックエンドURL */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

/** スタブのエントリポイント */
window.onload = () => {
  const sdk = createOfflineBrowserSDK({ backendURL: BACKEND_URL });
  sdk.enterRoom({
    armdozerId: ArmdozerIds.SHIN_BRAVER,
    pilotId: PilotIds.SHINYA,
  });
};
