/**
 * 経路として選択されたローカル ICE Candidate の概要を取得する
 * @param connection WebRTCコネクション
 * @returns 経路として選択されたローカル ICE Candidate の概要文字列、存在しない場合は null
 */
export const getSelectedLocalIceCandidateSummary = async (
  connection: RTCPeerConnection,
) => {
  const stats = await connection.getStats();
  const candidatePair = Array.from(stats.values()).find(
    (r) =>
      r.type === "candidate-pair" && r.state === "succeeded" && r.nominated,
  );
  if (!candidatePair) {
    return null;
  }

  const { localCandidate: local } = candidatePair;
  return `${local?.candidateType} ${local?.protocol} ${local?.relayProtocol}`;
};
