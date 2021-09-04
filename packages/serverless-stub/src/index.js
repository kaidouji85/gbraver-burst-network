// @flow

import {createBrowserSDK} from '@gbraver-burst-network/browser-sdk';
import type {UseCase} from "./use-case/use-case";
import {PingUseCase} from "./use-case/ping";
import {BattlePlayer01} from "./use-case/battle-player-01";
import {BattlePlayer02} from "./use-case/battle-player-02";

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN ?? '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID ?? '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE ?? '';
const API_URL = process.env.API_URL ?? '';

window.onload = async () => {
  const browserSDK = await createBrowserSDK(window.location.origin, API_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE);
  if (browserSDK.isLoginSuccessRedirect()) {
    await browserSDK.afterLoginSuccess();
  }

  const useCases: UseCase[] = [
    new PingUseCase(browserSDK),
    new BattlePlayer01(browserSDK),
    new BattlePlayer02(browserSDK),
  ];
  console.log(useCases);
  const loginForm = document.getElementById('login-form') ?? document.createElement('form');
  const loginButton = document.getElementById('login-button') ?? document.createElement('button');
  const logoutForm = document.getElementById('logout-form') ?? document.createElement('form');
  const logoutButton = document.getElementById('logout-button') ?? document.createElement('button');
  const useCaseForm = document.getElementById('use-case-form') ?? document.createElement('form');
  const useCaseSelectorSearchResult = document.getElementById('use-case-selector');
  const useCaseSelector: HTMLSelectElement = (useCaseSelectorSearchResult instanceof HTMLSelectElement)
    ? useCaseSelectorSearchResult
    : document.createElement('select');
  const useCaseExecuteButtonSearchResult = document.getElementById('use-case-execute-button');
  const useCaseExecuteButton: HTMLButtonElement = (useCaseExecuteButtonSearchResult instanceof HTMLButtonElement)
    ? useCaseExecuteButtonSearchResult
    : document.createElement('button');

  const updateScreen = async () => {
    const isLogin = await browserSDK.isLogin();
    loginForm.style.display = isLogin ? 'none' : 'block';
    logoutForm.style.display = isLogin ? 'block' : 'none';
    useCaseForm.style.display = isLogin ? 'block' : 'none';
  };
  useCases.forEach((v, index) => {
    const item = document.createElement('option');
    item.innerText = v.name();
    item.value = index.toString();
    useCaseSelector.appendChild(item);
  });
  loginButton.addEventListener('click', async () => {
    await browserSDK.gotoLoginPage();
  });
  logoutButton.addEventListener('click', async () => {
    await browserSDK.logout();
    await updateScreen();
  });
  useCaseExecuteButton.addEventListener('click', async () => {
    const useCaseIndex = Number(useCaseSelector.value);
    if (isNaN(useCaseIndex)) {
      return;
    }

    const useCase = useCases[useCaseIndex];
    if (!useCase) {
      return;
    }

    useCaseExecuteButton.disabled = true;
    await useCase.execute();
    useCaseExecuteButton.disabled = false;
  });

  updateScreen();
};