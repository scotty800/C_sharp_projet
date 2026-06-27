// components/shop-studio/blocks/navbar/injectNavbarStyles.ts
let injected = false;
export function injectNavbarStyles() {
  if (injected || typeof document === 'undefined') return;
  injected = true;
  const style = document.createElement('style');
  style.textContent = `
    .navbtn-hover-underline { position: relative; }
    .navbtn-hover-underline::after { content:''; position:absolute; left:14px; right:14px; bottom:4px; height:2px; background:currentColor; transform:scaleX(0); transition:transform .2s ease; }
    .navbtn-hover-underline:hover::after { transform:scaleX(1); }
    .navbtn-hover-background:hover { filter: brightness(1.1); }
    .navbtn-hover-scale:hover { transform: scale(1.06); }
    .navbtn-hover-glow:hover { box-shadow: 0 0 12px currentColor; }
  `;
  document.head.appendChild(style);
}