import { issueCoturnCredential } from "../webrtc-helper/issue-coturn-credential";

/**
 * RTCPeerConnectionを作成する
 * @param options オプション
 * @param options.webRTCHelperApiURL WebRTCヘルパーAPIのURL
 * @param options.coturnDomainName coturnサーバーのドメイン名
 * @param options.authToken 認証トークン
 * @returns 作成したRTCPeerConnection
 */
export const createRTCPeerConnection = async (options: {
  webRTCHelperApiURL: string;
  coturnDomainName: string;
  authToken: string;
}): Promise<RTCPeerConnection> => {
  const { webRTCHelperApiURL, coturnDomainName, authToken } = options;
  const { username, password: credential } = await issueCoturnCredential({
    apiURL: webRTCHelperApiURL,
    authToken,
  });
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
