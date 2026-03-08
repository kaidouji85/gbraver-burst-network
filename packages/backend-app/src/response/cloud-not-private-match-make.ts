/** オーナーがプライベートマッチングできなかった */
export type CouldNotPrivateMatchMaking = {
  action: "cloud-not-private-match-making";
};

/** オーナーがプライベートマッチングできなかった（定数） */
export const CLOUD_NOT_PRIVATE_MATCH_MAKE: CouldNotPrivateMatchMaking = {
  action: "cloud-not-private-match-making",
};
