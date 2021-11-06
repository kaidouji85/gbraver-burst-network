// @flow

export async function deleteLoggedInAccount(restAPIURL: string): Promise<void> {
  await fetch(`${restAPIURL}`, {
    mode: 'cors',
    method: 'DELETE'
  });
}