import { z } from "zod";

/** シグナリングチャネルの有効期間（秒） */
export const SIGNALING_CHANNEL_TTL_SECONDS = 60 * 10;

/** シグナリングチャネル */
export type SignalingChannel = {
  /** シグナリングID */
  signalingID: string;
  /** ホストのWebSocket API Gateway コネクションID */
  hostConnectionId: string;
  /** ゲストのWebSocket API Gateway コネクションID */
  guestConnectionId: string;
  /** チャネルの有効期限（Unixタイムスタンプ） */
  expiresAt: number;
};

/** SignalingChannel zodスキーマ */
export const SignalingChannelSchema = z.object({
  signalingID: z.string(),
  hostConnectionId: z.string(),
  guestConnectionId: z.string(),
  expiresAt: z.number(),
});

/**
 * シグナリングチャネルを生成する
 * @param options オプション
 * @param options.hostConnectionId ホストのWebSocket API Gateway コネクションID
 * @param options.guestConnectionId ゲストのWebSocket API Gateway コネクションID
 * @returns
 */
export const createSignalingChannel = (options: {
  hostConnectionId: string;
  guestConnectionId: string;
}): SignalingChannel => {
  const { hostConnectionId, guestConnectionId } = options;
  return {
    signalingID: crypto.randomUUID(),
    hostConnectionId,
    guestConnectionId,
    expiresAt: Math.floor(Date.now() / 1000) + SIGNALING_CHANNEL_TTL_SECONDS,
  };
};

/**
 * チャネルにある全てのコネクションIDを取得する
 * @param signalingChannel シグナリングチャネル
 * @returns 取得結果
 */
export const getChannelConnectionIds = (
  signalingChannel: SignalingChannel,
): string[] => [
  signalingChannel.hostConnectionId,
  signalingChannel.guestConnectionId,
];
