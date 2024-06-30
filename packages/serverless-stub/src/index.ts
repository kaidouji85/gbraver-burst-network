import {createBrowserSDK, initializeBrowserSDK } from "@gbraver-burst-network/browser-sdk";

import { BattlePlayer01 } from "./use-case/battle-player-01";
import { BattlePlayer02 } from "./use-case/battle-player-02";
import { DeleteUserCase } from "./use-case/delete-user";
import { DisconnectWebsocketCase } from "./use-case/disconnect-websocket";
import { GetUserNameCase } from "./use-case/get-user-name";
import { GetUserPictureURLCase } from "./use-case/get-user-picture-url";
import { MailAddressGet } from "./use-case/mail-address-get";
import { PingUseCase } from "./use-case/ping";
import { PrivateMatchRoomOwner } from "./use-case/private-match-room-owner";
import { PrivateMatchRoomPlayer } from "./use-case/private-match-room-player";
import { UseCase } from "./use-case/use-case";

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID ?? "";
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID ?? "";
const COGNITO_HOSTED_UI_DOMAIN = process.env.COGNITO_HOSTED_UI_DOMAIN ?? "";
const WEBSOCKET_API_URL = process.env.WEBSOCKET_API_URL ?? "";

window.onload = async () => {
  initializeBrowserSDK({
    ownURL: window.location.origin,
    userPoolId: COGNITO_USER_POOL_ID,
    userPoolClientId: COGNITO_CLIENT_ID,
    hostedUIDomain: COGNITO_HOSTED_UI_DOMAIN,
  });
  const browserSDK = await createBrowserSDK(WEBSOCKET_API_URL);
  browserSDK.websocketErrorNotifier().subscribe((e) => {
    console.log("websocketErrorNotifier", e);
  });

  const useCases: UseCase[] = [
    new PingUseCase(browserSDK),
    new BattlePlayer01(browserSDK),
    new BattlePlayer02(browserSDK),
    new PrivateMatchRoomOwner(browserSDK),
    new PrivateMatchRoomPlayer(browserSDK),
    new GetUserNameCase(browserSDK),
    new GetUserPictureURLCase(browserSDK),
    new MailAddressGet(browserSDK),
    new DisconnectWebsocketCase(browserSDK),
    new DeleteUserCase(browserSDK),
  ];
  const loginForm =
    document.getElementById("login-form") ?? document.createElement("form");
  const loginButton =
    document.getElementById("login-button") ?? document.createElement("button");
  const logoutForm =
    document.getElementById("logout-form") ?? document.createElement("form");
  const logoutButton =
    document.getElementById("logout-button") ??
    document.createElement("button");
  const useCaseForm =
    document.getElementById("use-case-form") ?? document.createElement("form");
  const useCaseSelectorSearchResult =
    document.getElementById("use-case-selector");
  const useCaseSelector: HTMLSelectElement =
    useCaseSelectorSearchResult instanceof HTMLSelectElement
      ? useCaseSelectorSearchResult
      : document.createElement("select");
  const privateMatchRoomIDSearchResult = document.getElementById(
    "private-match-room-id",
  );
  const privateMatchRoomID: HTMLInputElement =
    privateMatchRoomIDSearchResult instanceof HTMLInputElement
      ? privateMatchRoomIDSearchResult
      : document.createElement("input");
  const useCaseExecuteButtonSearchResult = document.getElementById(
    "use-case-execute-button",
  );
  const useCaseExecuteButton: HTMLButtonElement =
    useCaseExecuteButtonSearchResult instanceof HTMLButtonElement
      ? useCaseExecuteButtonSearchResult
      : document.createElement("button");

  const updateScreen = async () => {
    const isLogin = await browserSDK.isLogin();
    loginForm.style.display = isLogin ? "none" : "block";
    logoutForm.style.display = isLogin ? "block" : "none";
    useCaseForm.style.display = isLogin ? "block" : "none";
  };

  useCases.forEach((v, index) => {
    const item = document.createElement("option");
    item.innerText = v.name();
    item.value = index.toString();
    useCaseSelector.appendChild(item);
  });
  loginButton.addEventListener("click", async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    await browserSDK.gotoLoginPage();
  });
  logoutButton.addEventListener("click", async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    await browserSDK.logout();
    await updateScreen();
  });
  useCaseExecuteButton.addEventListener("click", async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const useCaseIndex = Number(useCaseSelector.value);
    if (isNaN(useCaseIndex)) {
      return;
    }

    const useCase = useCases[useCaseIndex];
    if (!useCase) {
      return;
    }

    useCaseExecuteButton.disabled = true;
    await useCase.execute({
      privateMatchRoomID: privateMatchRoomID.value,
    });
    useCaseExecuteButton.disabled = false;
  });
  updateScreen();
};
