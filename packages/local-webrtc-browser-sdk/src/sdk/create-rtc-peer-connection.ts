import { issueCoturnCredential } from "../webrtc-helper/issue-coturn-credential";

/**
 * RTPeerConnectionを作成する
 * @param options オプション
 * @param options.webRTCHelperApiURL WebRTCヘルパーAPIのURL
 * @param options.coturnDomainName coturnサーバーのドメイン名
 * @returns 作成したRTCPeerConnection
 */
export const createRTCPeerConnection = async (options: {
  /** WebRTCヘルパーAPIのURL */
  webRTCHelperApiURL: string;
  /** coturnサーバーのドメイン名 */
  coturnDomainName: string;
}): Promise<RTCPeerConnection> => {
  const { webRTCHelperApiURL, coturnDomainName } = options;
  const { username, password: credential } =
    await issueCoturnCredential(webRTCHelperApiURL);
  return new RTCPeerConnection({
    iceServers: [
      {
        urls: [`stun:${coturnDomainName}:3478`],
      },
      {
        urls: [
          `turn:${coturnDomainName}:3478?transport=udp`,
          `turn:${coturnDomainName}:3478?transport=tcp`,
          `turns:${coturnDomainName}:5349?transport=tcp`,
        ],
        username,
        credential,
      },
    ],
  });
};
