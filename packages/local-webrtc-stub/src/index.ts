import { GuestPlayer } from "./use-case/guest-player";
import { HostPlayer } from "./use-case/host-player";
import { UseCase } from "./use-case/use-case";

/**
 * エントリポイント
 */
window.onload = () => {
  const useCases: UseCase[] = [new HostPlayer(), new GuestPlayer()];

  const foundUseCaseSelector = document.getElementById("use-case-selector");
  const useCaseSelector: HTMLSelectElement =
    foundUseCaseSelector instanceof HTMLSelectElement
      ? foundUseCaseSelector
      : document.createElement("select");

  useCases.forEach((v, index) => {
    const item = document.createElement("option");
    item.innerText = v.name();
    item.value = index.toString();
    useCaseSelector.appendChild(item);
  });
};
