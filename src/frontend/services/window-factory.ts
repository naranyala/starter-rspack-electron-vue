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
  onmaximize?: () => void;
  onrestore?: () => void;
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

// SVG Icons for titlebar buttons
const ICONS = {
  minimize: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
  maximize: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><rect x="4" y="4" width="16" height="16"></rect></svg>`,
  restore: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><rect x="8" y="8" width="12" height="12"></rect><polyline points="4 16 4 4 16 4"></polyline></svg>`,
  close: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg>`,
  fullscreen: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="square"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></line><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`,
};

// Track sidebar width for maximize bounds
let sidebarWidth = 0;

export function setSidebarWidth(width: number): void {
  sidebarWidth = width;
}

export function getSidebarWidth(): number {
  return sidebarWidth;
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

    // Track maximize state
    let isMaximized = false;
    let preMaximizeBounds: { x: number; y: number; width: number; height: number } | null = null;

    // Inject icons and setup button handlers after WinBox renders
    setTimeout(() => {
      // Update content
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
        const header = winboxRoot.querySelector('.wb-header');
        if (header) {
          // Ensure proper structure for flexbox layout
          header.style.display = 'flex';
          header.style.alignItems = 'center';
          header.style.justifyContent = 'flex-start';
          header.style.cursor = 'move';
          header.style.userSelect = 'none';

          // Ensure controls are on the right side
          const controls = header.querySelector('.wb-controls');
          if (controls) {
            controls.style.marginLeft = 'auto';
            controls.style.order = '2';
          }

          // Ensure title is in the middle
          const title = header.querySelector('.wb-title');
          if (title) {
            title.style.order = '1';
            title.style.flex = '1';
            title.style.minWidth = '0';
          }

          // Add double-click handler to title bar for maximize/restore
          header.addEventListener('dblclick', (e: MouseEvent) => {
            // Don't trigger if clicking on buttons
            if ((e.target as HTMLElement).closest('.wb-control')) {
              return;
            }

            if (isMaximized) {
              // Restore to previous bounds
              if (preMaximizeBounds) {
                winbox.resize(preMaximizeBounds.width, preMaximizeBounds.height);
                winbox.move(preMaximizeBounds.x, preMaximizeBounds.y);
              }
              winboxRoot.classList.remove('wb-maximize');
              isMaximized = false;

              // Update maximize button icon
              const maxBtn = winboxRoot.querySelector('.wb-max');
              if (maxBtn) {
                maxBtn.innerHTML = ICONS.maximize;
                maxBtn.setAttribute('aria-label', 'Maximize');
              }

              // Callback
              options.onrestore?.();
            } else {
              // Save current bounds
              preMaximizeBounds = {
                x: winbox.x,
                y: winbox.y,
                width: winbox.width,
                height: winbox.height,
              };

              // Maximize with sidebar offset
              maximizeWindow(winbox, winboxRoot);
              isMaximized = true;

              // Update maximize button icon
              const maxBtn = winboxRoot.querySelector('.wb-max');
              if (maxBtn) {
                maxBtn.innerHTML = ICONS.restore;
                maxBtn.setAttribute('aria-label', 'Restore');
              }

              // Callback
              options.onmaximize?.();
            }
          });
        }

        // Close button - X icon
        const closeBtn = winboxRoot.querySelector('.wb-close');
        if (closeBtn) {
          closeBtn.innerHTML = ICONS.close;
          closeBtn.setAttribute('role', 'button');
          closeBtn.setAttribute('aria-label', 'Close');
          closeBtn.setAttribute('tabindex', '0');
        }

        // Minimize button - minus icon
        const minBtn = winboxRoot.querySelector('.wb-min');
        if (minBtn) {
          minBtn.innerHTML = ICONS.minimize;
          minBtn.setAttribute('role', 'button');
          minBtn.setAttribute('aria-label', 'Minimize');
          minBtn.setAttribute('tabindex', '0');
        }

        // Maximize/Restore button - square icon (changes dynamically)
        const maxBtn = winboxRoot.querySelector('.wb-max');
        if (maxBtn) {
          maxBtn.innerHTML = ICONS.maximize;
          maxBtn.setAttribute('role', 'button');
          maxBtn.setAttribute('aria-label', 'Maximize');
          maxBtn.setAttribute('tabindex', '0');

          // Add click handler for manual maximize/restore
          maxBtn.addEventListener('click', (e: Event) => {
            e.stopPropagation();

            if (isMaximized) {
              // Restore
              if (preMaximizeBounds) {
                winbox.resize(preMaximizeBounds.width, preMaximizeBounds.height);
                winbox.move(preMaximizeBounds.x, preMaximizeBounds.y);
              }
              winboxRoot.classList.remove('wb-maximize');
              maxBtn.innerHTML = ICONS.maximize;
              maxBtn.setAttribute('aria-label', 'Maximize');
              isMaximized = false;
              options.onrestore?.();
            } else {
              // Maximize
              preMaximizeBounds = {
                x: winbox.x,
                y: winbox.y,
                width: winbox.width,
                height: winbox.height,
              };
              maximizeWindow(winbox, winboxRoot);
              maxBtn.innerHTML = ICONS.restore;
              maxBtn.setAttribute('aria-label', 'Restore');
              isMaximized = true;
              options.onmaximize?.();
            }
          });
        }

        // Fullscreen button - expand icon
        const fullBtn = winboxRoot.querySelector('.wb-full');
        if (fullBtn) {
          fullBtn.innerHTML = ICONS.fullscreen;
          fullBtn.setAttribute('role', 'button');
          fullBtn.setAttribute('aria-label', 'Fullscreen');
          fullBtn.setAttribute('tabindex', '0');
        }

        // Listen for maximize/restore changes to update icon
        const maxBtnElement = winboxRoot.querySelector('.wb-max');
        if (maxBtnElement) {
          // Create a mutation observer to detect icon changes
          const observer = new MutationObserver(() => {
            // Re-inject maximize icon if it was changed
            const wasMaximized = isMaximized;
            const nowMaximized = winboxRoot.classList.contains('wb-maximize');
            
            if (wasMaximized !== nowMaximized) {
              isMaximized = nowMaximized;
              maxBtnElement.innerHTML = isMaximized ? ICONS.restore : ICONS.maximize;
              maxBtnElement.setAttribute('aria-label', isMaximized ? 'Restore' : 'Maximize');
            }
          });
          
          observer.observe(maxBtnElement, {
            attributes: true,
            attributeFilter: ['class'],
            subtree: true,
          });

          // Store observer for cleanup
          (winbox as any)._maxObserver = observer;
        }

        // Add drag handle double-click handler
        const dragHandle = winboxRoot.querySelector('.wb-drag');
        if (dragHandle) {
          dragHandle.addEventListener('dblclick', (e: MouseEvent) => {
            e.stopPropagation();
            // Trigger the same maximize/restore logic
            header.dispatchEvent(new MouseEvent('dblclick', e));
          });
        }
      }
    }, 100);

    // Cleanup observer on close
    const originalClose = winbox.close.bind(winbox);
    winbox.close = () => {
      if ((winbox as any)._maxObserver) {
        (winbox as any)._maxObserver.disconnect();
      }
      return originalClose();
    };

    return winbox;
  }
}

/**
 * Maximize window respecting sidebar width
 */
function maximizeWindow(winbox: any, winboxRoot: Element): void {
  // Get the main application window bounds
  const appContainer = document.querySelector('.App') as HTMLElement;
  const sidebar = document.querySelector('.App-sidebar') as HTMLElement;
  
  // Calculate available space
  const sidebarOpen = sidebar?.classList.contains('is-open');
  const sidebarOffset = sidebarOpen ? (sidebarWidth || sidebar?.offsetWidth || 0) : 0;
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Calculate maximize bounds (respecting sidebar)
  const maximizeX = sidebarOffset;
  const maximizeWidth = viewportWidth - sidebarOffset;
  const maximizeY = 0;
  const maximizeHeight = viewportHeight;
  
  // Apply maximize bounds
  winbox.resize(maximizeWidth, maximizeHeight);
  winbox.move(maximizeX, maximizeY);
  
  // Add maximize class for styling
  winboxRoot.classList.add('wb-maximize');
  
  // Store maximize bounds for future reference
  (winbox as any)._maximizeBounds = {
    x: maximizeX,
    y: maximizeY,
    width: maximizeWidth,
    height: maximizeHeight,
  };
}
