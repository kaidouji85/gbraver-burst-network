// @flow

import {createBrowserSDK} from '@gbraver-burst-network/browser-sdk';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN ?? '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID ?? '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE ?? '';
const API_URL = process.env.API_URL ?? '';

window.onload = async () => {
  const browserSDK = await createBrowserSDK(AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE, API_URL);
  if (browserSDK.isLoginSuccessRedirect()) {
    await browserSDK.afterLoginSuccess();
  }

  const loginForm = document.getElementById('login-form') ?? document.createElement('form');
  const loginButton = document.getElementById('login-button') ?? document.createElement('button');
  const logoutForm = document.getElementById('logout-form') ?? document.createElement('form');
  const logoutButton = document.getElementById('logout-button') ?? document.createElement('button');

  const updateScreen = async () => {
    const isLogin = await browserSDK.isLogin();
    loginForm.style.display = isLogin ? 'none' : 'block';
    logoutForm.style.display = isLogin ? 'block' : 'none';
  };
  loginButton.addEventListener('click', async () => {
    await browserSDK.gotoLoginPage();
  });
  logoutButton.addEventListener('click', async () => {
    await browserSDK.logout();
    await updateScreen();
  });
};