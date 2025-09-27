import {
  Armdozers,
  InputCommand,
  Pilots,
  Player,
  Selectable,
} from "gbraver-burst-core";

import { createOfflineBrowserSDK } from "./";
import { BattleInfo } from "./offline-browser-sdk";

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
 * セレクターを操作不可能にする
 */
const disabledSelector = () => {
  document.getElementById("armdozer")?.setAttribute("disabled", "true");
  document.getElementById("pilot")?.setAttribute("disabled", "true");
  document.getElementById("enter-room")?.setAttribute("disabled", "true");
};

const updateCommands = (selectable: Selectable) => {
  const commandSelector = document.getElementById("command-selector") as HTMLSelectElement;
  selectable.command.forEach((command, index) => {
    const option = document.createElement("option");
    option.value = index.toString();
    option.text = JSON.stringify(command);
    commandSelector.appendChild(option);
  });
};

/** スタブのエントリポイント */
window.onload = () => {
  updateArmdozerOptions();
  updatePilotOptions();
  const sdk = createOfflineBrowserSDK({ backendURL: BACKEND_URL });

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
      updateCommands(commands);
    }
  });
};
