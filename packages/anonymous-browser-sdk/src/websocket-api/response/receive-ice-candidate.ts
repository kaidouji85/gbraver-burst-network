import { z } from "zod";

import { RTCIceCandidateInitSchema } from "../../webrtc/rtc-ice-candidate-init-schema";

/** 相手からICE candidate を受信した */
export type ReceiveICECandidate = {
  type: "receive-ice-candidate";
  /** シグナリングID */
  signalingID: string;
  /** ICE candidate */
  iceCandidate: RTCIceCandidateInit;
};

/** ReceiveICECandidate zod スキーマ */
export const ReceiveICECandidateSchema = z.object({
  type: z.literal("receive-ice-candidate"),
  signalingID: z.string(),
  iceCandidate: RTCIceCandidateInitSchema,
});
