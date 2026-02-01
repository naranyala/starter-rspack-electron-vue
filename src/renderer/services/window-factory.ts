import 'winbox';
import 'winbox/dist/css/winbox.min.css';
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
  [key: string]: unknown;
}

interface WinBoxWindow {
  body: HTMLElement;
  close: () => void;
  minimize: () => void;
  maximize: () => void;
  restore: () => void;
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
          closeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
        }

        // Maximize button - square icon
        const maxBtn = (winboxRoot as HTMLElement).querySelector('.wb-max');
        if (maxBtn) {
          maxBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`;
        }

        // Minimize button - minus icon
        const minBtn = (winboxRoot as HTMLElement).querySelector('.wb-min');
        if (minBtn) {
          minBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        }

        // Fullscreen button - expand icon
        const fullBtn = (winboxRoot as HTMLElement).querySelector('.wb-full');
        if (fullBtn) {
          fullBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>`;
        }
      }
    }, 50);

    return winbox;
  }
}
