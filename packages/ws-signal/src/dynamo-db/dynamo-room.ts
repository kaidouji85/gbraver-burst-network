import {
  RTCIceCandidateInit,
  RTCSessionDescriptionInit,
} from "../core/web-rtc";

/** DynamoDBスキーマ room */
export type DynamoRoom = {
  /** ルームID（パーティションキー） */
  roomID: string;
  /** ルームに入室可能であるか否か、trueで入室可能 */
  canEntry: boolean;
  /** ルームのホストのシグナル情報 */
  hostSignal: {
    /** WebRTCのセッション記述 */
    sdp: RTCSessionDescriptionInit;
    /** WebRTCのICE候補 */
    iceCandidates: RTCIceCandidateInit[];
  };
};
