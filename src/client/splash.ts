import { requestExpandedMode } from '@devvit/web/client';
import { delayPromised, FormDataJSON } from './classes/FormDataJSON';
import { showToast, navigateTo } from '@devvit/web/client';
import { isLoggedIn, currentUserIsCurrentlyBanned } from './first';

if (isLoggedIn && !currentUserIsCurrentlyBanned) {
  document.querySelector('button[type=button]')?.addEventListener('click',
    // @ts-expect-error
    event => requestExpandedMode(event, 'game'));
  let preventSubmit = false;
  const form = document.querySelector('form');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    if (preventSubmit) return showToast('no submitting in quick succession');
    preventSubmit = true;
    const body = JSON.stringify(new FormDataJSON(form));
    fetch('/api/posts', {
      method: 'POST', body,
      headers: { 'content-type': 'application/json' },
    }).then(async resp => {
      const json = await resp.json();
      if (resp.ok) {
        const { permalink } = json, to = new URL(permalink, 'https://reddit.com/');
        navigateTo(`${to}`);
      } else {
        showToast('Failed to submit post ' + JSON.stringify(json['error']));
      }
    }).then(delayPromised(500)).finally(() => preventSubmit = false);
  });
} else {
  const submit = document.querySelector('form button[type=submit]')! as HTMLButtonElement;
  // document.querySelectorAll('form input,form textarea,form button').forEach(each => each.setAttribute('disabled', String()));
  submit.textContent = currentUserIsCurrentlyBanned ? 'current User Is Currently Banned' : 'Your Not Logged In';
  submit.disabled = true;
}
