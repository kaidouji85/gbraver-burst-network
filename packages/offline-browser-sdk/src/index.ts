import { OfflineBrowserSDK } from "./offline-browser-sdk";
import { OfflineBrowserSDKImpl } from "./offline-browser-sdk-impl";

/** オフライン用ブラウザSDKオプション */
export type OfflineBrowserSDKOptions = {
  /** バックエンドURL */
  backendURL: string;
};

/**
 * オフライン用ブラウザSDKを生成する
 * @param options オプション
 * @returns オフライン用ブラウザSDK
 */
export const createOfflineBrowserSDK = (
  options: OfflineBrowserSDKOptions,
): OfflineBrowserSDK => new OfflineBrowserSDKImpl(options);
