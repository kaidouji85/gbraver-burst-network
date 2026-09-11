import { z } from "zod";

import {
  RTCIceCandidateInit,
  RTCIceCandidateInitSchema,
} from "../../core/webrtc";

/** ICE candidateを送信する */
export type SendICECandidate = {
  action: "send-ice-candidate";
  /** シグナリングID */
  signalingID: string;
  /** ICE candidate */
  iceCandidate: RTCIceCandidateInit;
};

/** SendICECandidate zod スキーマ */
export const SendICECandidateSchema = z.object({
  action: z.literal("send-ice-candidate"),
  signalingID: z.string(),
  iceCandidate: RTCIceCandidateInitSchema,
});
