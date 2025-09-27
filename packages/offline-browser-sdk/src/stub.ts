import { Armdozers, Pilots, Player, Selectable } from "gbraver-burst-core";

import { createOfflineBrowserSDK } from "./";

/** バックエンドURL */
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";

/**
 * アームドーザのセレクターを取得する
 * @returns アームドーザのセレクター
 */
const getArmdozerSelector = () =>
  document.getElementById("armdozer") as HTMLSelectElement;

/**
 * アームドーザの選択肢を更新する
 */
const updateArmdozerOptions = () => {
  const armdozerSelect = getArmdozerSelector();
  Armdozers.forEach((armdozer) => {
    const option = document.createElement("option");
    option.value = armdozer.id;
    option.text = armdozer.name;
    armdozerSelect.appendChild(option);
  });
};

/**
 * パイロットのセレクターを取得する
 * @returns パイロットのセレクター
 */
const getPilotSelector = () =>
  document.getElementById("pilot") as HTMLSelectElement;

/**
 * パイロットの選択肢を更新する
 */
const updatePilotOptions = () => {
  const pilotSelect = getPilotSelector();
  Pilots.forEach((pilot) => {
    const option = document.createElement("option");
    option.value = pilot.id;
    option.text = pilot.name;
    pilotSelect.appendChild(option);
  });
};

/**
 * キャラクターセレクターを操作不可能にする
 */
const disabledSelector = () => {
  document.getElementById("armdozer")?.setAttribute("disabled", "true");
  document.getElementById("pilot")?.setAttribute("disabled", "true");
  document.getElementById("enter-room")?.setAttribute("disabled", "true");
};

/**
 * コマンドセレクターを非表示にする
 */
const hiddenCommands = () => {
  document.getElementById("commands")?.setAttribute("style", "display:none");
};

/**
 * コマンドセレクターを表示する
 */
const showCommands = () => {
  document.getElementById("commands")?.setAttribute("style", "display:block");
};

/**
 * コマンドセレクターを更新する
 * @param selectable 選択可能なコマンド
 */
const updateCommands = (selectable: Selectable) => {
  const commandSelector = document.getElementById(
    "command-selector",
  ) as HTMLSelectElement;
  selectable.command.forEach((command) => {
    const option = document.createElement("option");
    const jsonStr = JSON.stringify(command);
    option.value = jsonStr;
    option.text = jsonStr;
    commandSelector.appendChild(option);
  });
};

/**
 * 現在のプレイヤー情報
 * 対戦以外ではnullが入る
 */
let player: Player | null = null;

/** スタブのエントリポイント */
window.onload = () => {
  hiddenCommands();
  updateArmdozerOptions();
  updatePilotOptions();
  const sdk = createOfflineBrowserSDK({ backendURL: BACKEND_URL });

  /**
   * 入室ボタンのクリックイベント
   */
  document.getElementById("enter-room")?.addEventListener("click", async () => {
    const armdozerSelect = getArmdozerSelector();
    const pilotSelect = getPilotSelector();
    disabledSelector();

    const battleInfo = await sdk.enterRoom({
      armdozerId: armdozerSelect.value,
      pilotId: pilotSelect.value,
    });

    console.log("matched", battleInfo);
    const inputCommand = battleInfo.stateHistory.findLast(
      (s) => s.effect.name === "InputCommand",
    );
    if (inputCommand?.effect.name !== "InputCommand") {
      return;
    }

    const commands = inputCommand.effect.players.find(
      (p) => p.playerId === battleInfo.player.playerId,
    );
    if (commands?.selectable) {
      player = battleInfo.player;
      updateCommands(commands);
      showCommands();
    }
  });

  /**
   * エラーが発生した時の処理
   */
  sdk.notifyError().subscribe((error) => {
    console.error("error occurred", error);
  });
};
