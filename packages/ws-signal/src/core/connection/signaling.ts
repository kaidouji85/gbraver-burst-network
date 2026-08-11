import { z } from "zod";

/** シグナリング中 */
export type Signaling = {
  /** シグナリングID */
  signalingID: string;
  /** あいことば対戦のホストであるか否か、trueでホスト */
  isHost: boolean;
};

/** Signaling zodスキーマ */
export const SignalingSchema = z.object({
  signalingID: z.string(),
  isHost: z.boolean(),
});
