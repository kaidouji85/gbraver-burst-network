import { createOfflineBrowserSDK } from ".";

window.onload = () => {
  createOfflineBrowserSDK({ backendURL: "http://localhost:3000" });
};
