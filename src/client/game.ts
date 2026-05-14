import { delayPromised, FormDataJSON } from './classes/FormDataJSON';
import { showToast, navigateTo } from '@devvit/web/client';
import { v4 as uuidv4 } from 'uuid';
import { sliceBlob } from './functions/sliceBlob';
import { currentUserIsCurrentlyBanned, isLoggedIn } from './first';

if (isLoggedIn && !currentUserIsCurrentlyBanned) {
  let preventSubmit = false;
  const form = document.querySelector('form');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    if (preventSubmit) return showToast('no submitting in quick succession');
    preventSubmit = true;
    const blobs = await Promise.all(Array.from(document.querySelectorAll(
        'canvas.image') as ArrayLike<HTMLCanvasElement>,
      canvas => (new Promise<Blob | null>(res => canvas.toBlob(res)))));
    const bodyData = new FormDataJSON(form);
    if (blobs.length) {
      showToast('images detected, uploading them');
      try {
        const allOk = await Promise.all(blobs.map(async blob => {
          if (blob) {
            const uuid = uuidv4();
            const slices = sliceBlob(blob);
            await Promise.all(slices.map((body, index) => fetch(`/api/image/upload?uuid=${uuid}&index=${index}`, {
              headers: { 'content-type': 'application/octet-stream' },
              method: 'POST', body,
            }).then(resp => {
              if (!resp.ok) throw resp;
              return resp;
            })));
            return fetch(`/api/image/finalize?uuid=${uuid}&length=${slices.length}`, { method: 'POST' }).then(resp => {
              if (!resp.ok) throw resp;
              return resp.json().then(json => json.mediaUrl as string);
            });
          }
        }));
        bodyData.set('imageHrefs', allOk.join(' ').replaceAll(/ +/g, ' '));
      } catch {
        showToast('Failed to upload images');
        return;
      }
    }
    const body = JSON.stringify(bodyData);
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
  document.querySelector('button.add[type=button]')?.addEventListener('click', () => {
    addImageOption();
  });
} else {
  const submit = document.querySelector('form button[type=submit]')! as HTMLButtonElement;
  document.querySelectorAll('form input,form textarea,form button').forEach(each => each.setAttribute('disabled', String()));
  submit.textContent = currentUserIsCurrentlyBanned ? 'current User Is Currently Banned' : 'Your Not Logged In';
  submit.disabled = true;
}

function addImageOption() {
  const tr = document.createElement('div'),
    input = document.createElement('input'),
    label = document.createElement('label'),
    image = document.createElement('div'),
    butt = document.createElement('div'),
    td = document.createElement('div'),
    abort = new AbortController, { signal } = abort;
  input.accept = 'image/png,image/jpeg,image/avif,image/webp';
  input.type = 'file';
  label.append('image ', input, ':');
  image.append(label);
  tr.append(image, td, butt);
  tr.className = 'border padding-left border-control';
  input.addEventListener('change', _event => {
    createImageBitmap(input.files![0]!).then(bitmap => {
      // const offscreenCanvas = new OffscreenCanvas(bitmap.width, bitmap.height),
      //   context2d = offscreenCanvas.getContext('2d')!;
      // context2d.drawImage(bitmap, 0, 0);
      // return offscreenCanvas.convertToBlob();
      const canvas = document.createElement('canvas'),
        context2d = canvas.getContext('2d')!;
      canvas.height = bitmap.height;
      canvas.width = bitmap.width;
      canvas.className = 'border margin-bottom image';
      context2d.drawImage(bitmap, 0, 0);
      td.replaceChildren(canvas);
    });
  }, { signal });
  const mvUp = document.createElement('button'),
    mvDown = document.createElement('button'),
    del = document.createElement('button');
  mvDown.type = 'button';
  mvUp.type = 'button';
  mvUp.addEventListener('click', () => {
    tr.previousElementSibling?.insertAdjacentElement('beforebegin', tr);
  }, { signal });
  mvDown.addEventListener('click', () => {
    tr.nextElementSibling?.insertAdjacentElement('afterend', tr);
  }, { signal });
  del.addEventListener('click', () => {
    tr.remove();
    abort.abort();
  }, { signal });
  del.textContent = 'delete';
  mvUp.textContent = 'Move Up';
  mvDown.textContent = 'Move Down';
  butt.className = 'margin-bottom';
  butt.append(mvDown, '\x20', mvUp, '\x20', del);
  document.querySelector('div.images')?.append(tr);
}
