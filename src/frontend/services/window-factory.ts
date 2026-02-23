import 'winbox';
import { generateTheme, generateWindowContent } from './window-generator';

declare global {
  interface Window {
    WinBox: any;
  }
}

interface WindowOptions {
  width?: string;
  height?: string;
  x?: string | number;
  y?: string | number;
  onclose?: () => boolean | void;
  [key: string]: unknown;
}

interface WinBoxWindow {
  body: HTMLElement;
  close: () => void;
  minimize: () => void;
  maximize: () => void;
  restore: () => void;
  focus?: () => void;
  setBackground: (color: string) => void;
}

export class WindowFactory {
  static createWindow(
    title: string,
    customContent: string | null = null,
    options: WindowOptions = {}
  ): WinBoxWindow {
    const dynamicContent = customContent || generateWindowContent(title);
    const windowTheme = generateTheme(title);

    const windowOptions = {
      title: title,
      html: `<div class="winbox-content"><h3 style="color: ${windowTheme.color}; border-bottom-color: ${windowTheme.accent};">${title}</h3><div style="color: ${windowTheme.color};" class="winbox-dynamic-content">Loading content...</div></div>`,
      width: '550px',
      height: '450px',
      x: 'center',
      y: 'center',
      class: 'winbox-dark',
      background: windowTheme.bg,
      ...options,
    };

    // Access WinBox from the global window object
    const WinBox = (globalThis as any).WinBox || window.WinBox;
    if (!WinBox) {
      throw new Error('WinBox is not available. Please ensure it is properly imported.');
    }

    const winbox = new WinBox(windowOptions);

    setTimeout(() => {
      if (winbox?.body) {
        const contentDiv = winbox.body.querySelector('.winbox-dynamic-content');
        if (contentDiv) {
          contentDiv.innerHTML = dynamicContent;
        } else {
          winbox.body.innerHTML = `<div class="winbox-content"><h3 style="color: ${windowTheme.color}; border-bottom-color: ${windowTheme.accent};">${title}</h3><div style="color: ${windowTheme.color};">${dynamicContent}</div></div>`;
        }
      }

      // Inject SVG icons into titlebar buttons
      const winboxRoot = winbox.body?.closest('.winbox');
      if (winboxRoot) {
        // Close button - X icon
        const closeBtn = (winboxRoot as HTMLElement).querySelector('.wb-close');
        if (closeBtn) {
          closeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg>`;
        }

        // Maximize button - square icon
        const maxBtn = (winboxRoot as HTMLElement).querySelector('.wb-max');
        if (maxBtn) {
          maxBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><rect x="4" y="4" width="16" height="16"></rect></svg>`;
        }

        // Minimize button - minus icon
        const minBtn = (winboxRoot as HTMLElement).querySelector('.wb-min');
        if (minBtn) {
          minBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        }

        // Fullscreen button - expand icon
        const fullBtn = (winboxRoot as HTMLElement).querySelector('.wb-full');
        if (fullBtn) {
          fullBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`;
        }
      }
    }, 50);

    return winbox;
  }
}
