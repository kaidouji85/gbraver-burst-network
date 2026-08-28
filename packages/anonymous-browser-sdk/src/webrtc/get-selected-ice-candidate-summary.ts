/**
 * 経路として選択されたローカル ICE Candidate の概要を取得する
 * @param connection WebRTCコネクション
 * @returns 経路として選択されたローカル ICE Candidate の概要文字列、存在しない場合は null
 */
export const getSelectedIceCandidateSummary = async (
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

  const local = stats.get(candidatePair.localCandidateId);
  if (!local) {
    return null;
  }

  const candidateType = local.candidateType ?? "no-candidate-type";
  const protocol = local.protocol ?? "no-protocol";
  const relayProtocol = local.relayProtocol ?? null;
  return [candidateType, protocol, relayProtocol]
    .filter((v) => v !== null)
    .join(" ");
};
