// src/client/classes/setTimeElement.ts
export class SetTimeElement extends HTMLTimeElement {
  isEnhanced = true;

  setTime(date: Date | string | number) {
    const time = new Date(date);
    this.dateTime = time.toISOString();
    this.textContent = time.toString();
  }
}

customElements.define('settime-element', SetTimeElement, { extends: 'time' });
