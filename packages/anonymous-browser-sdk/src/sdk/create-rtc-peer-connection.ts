import { SignalContainer } from "../abort-controller/signal-container";
import { issueCoturnCredential } from "../http-api/issue-coturn-credential";

/**
 * RTCPeerConnectionを作成する
 * @param options オプション
 * @param options.anonymousBackendApiURL 匿名バックエンドREST APIのURL
 * @param options.coturnDomainName coturnサーバーのドメイン名
 * @param options.authToken 認証トークン
 * @param options.signal アボートシグナル
 * @returns 作成したRTCPeerConnection
 */
export const createRTCPeerConnection = async (options: Partial<SignalContainer> & {
  anonymousBackendApiURL: string;
  coturnDomainName: string;
  authToken: string;
}): Promise<RTCPeerConnection> => {
  const { anonymousBackendApiURL, coturnDomainName, authToken, signal } = options;
  const { username, password: credential } = await issueCoturnCredential({
    apiURL: anonymousBackendApiURL,
    authToken,
    signal,
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
