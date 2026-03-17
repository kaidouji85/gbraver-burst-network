import {
  createLocalWebRTCGuestSDK,
  createLocalWebRTCHostSDK,
} from "@gbraver-burst-network/local-webrtc-browser-sdk";

import { GuestPlayer } from "./use-case/guest-player";
import { HostPlayer } from "./use-case/host-player";
import { UseCase } from "./use-case/use-case";

/** WebSocketシグナルサーバーのURL */
const WS_SIGNAL_SERVER_URL = process.env.WS_SIGNAL_SERVER_URL || "";

/**
 * ユースケースセレクターを取得する
 * @returns 取得結果、セレクターが見つからない場合は新規作成したセレクター
 */
const getUseCaseSelector = (): HTMLSelectElement => {
  const foundUseCaseSelector = document.getElementById("use-case-selector");
  return foundUseCaseSelector instanceof HTMLSelectElement
    ? foundUseCaseSelector
    : document.createElement("select");
};

/**
 * ユースケース実行ボタンを取得する
 * @returns 取得結果、ボタンが見つからない場合は新規作成したボタン
 */
const getUseCaseExecuteButton = (): HTMLButtonElement => {
  const foundUseCaseExecuteButton = document.getElementById(
    "use-case-execute-button",
  );
  return foundUseCaseExecuteButton instanceof HTMLButtonElement
    ? foundUseCaseExecuteButton
    : document.createElement("button");
};

/**
 * ルームID入力欄を取得する
 * @returns 取得結果、入力欄が見つからない場合は新規作成した入力欄
 */
const getRoomIDInput = (): HTMLInputElement => {
  const foundRoomIDInput = document.getElementById("room-id");
  return foundRoomIDInput instanceof HTMLInputElement
    ? foundRoomIDInput
    : document.createElement("input");
};

/**
 * エントリポイント
 */
window.onload = () => {
  const hostSDK = createLocalWebRTCHostSDK(WS_SIGNAL_SERVER_URL);
  const guestSDK = createLocalWebRTCGuestSDK(WS_SIGNAL_SERVER_URL);
  const useCases: UseCase[] = [
    new HostPlayer(hostSDK),
    new GuestPlayer(guestSDK),
  ];

  const useCaseSelector = getUseCaseSelector();
  const useCaseExecuteButton = getUseCaseExecuteButton();
  const roomIDInput = getRoomIDInput();

  useCases.forEach((v, index) => {
    const item = document.createElement("option");
    item.innerText = v.name();
    item.value = index.toString();
    useCaseSelector.appendChild(item);
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
    const roomID = roomIDInput.value;
    await useCase.execute({ roomID });
    useCaseExecuteButton.disabled = false;
  });
};
