// FeatureCheckerButton.js
export class FeatureCheckerButton extends HTMLButtonElement {
  connectedCallback() {
    this.removeAttribute('disabled');
  }
}

customElements.define('feature-checker-button', FeatureCheckerButton, { extends: 'button' });
