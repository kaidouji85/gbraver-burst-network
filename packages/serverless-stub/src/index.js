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
};