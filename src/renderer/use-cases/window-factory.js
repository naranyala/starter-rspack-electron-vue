import 'winbox/dist/css/winbox.min.css';
import WinBox from 'winbox/src/js/winbox';
import { generateTheme, generateWindowContent } from '../lib/window-generator';

/**
 * Base window factory for creating winbox windows
 */
export class WindowFactory {
  /**
   * Create a winbox window with dynamic content based on title
   * @param {string} title - Title of the window
   * @param {string} customContent - Optional custom content, if not provided generates content based on title
   * @param {Object} options - Additional window options
   * @returns {WinBox} The created winbox window instance
   */
  static createWindow(title, customContent = null, options = {}) {
    // Generate dynamic content and theme based on the title if not provided
    const dynamicContent = customContent || generateWindowContent(title);
    const windowTheme = generateTheme(title);

    // Merge default options with provided options
    const windowOptions = {
      title: title,
      html: `<div class="winbox-content"><h3 style="color: ${windowTheme.color};">${title}</h3><div style="color: ${windowTheme.color};" class="winbox-dynamic-content">Loading content...</div></div>`,
      width: '500px',
      height: '400px',
      x: 'center',
      y: 'center',
      class: 'modern',
      background: windowTheme.bg,
      border: 4,
      ...options,
    };

    // Create a WinBox window with the generated content
    const winbox = new WinBox(windowOptions);

    // Set the content after the window is created using WinBox's body property
    setTimeout(() => {
      if (winbox?.body) {
        const contentDiv = winbox.body.querySelector('.winbox-dynamic-content');
        if (contentDiv) {
          contentDiv.innerHTML = dynamicContent;
        } else {
          // If we can't find the specific div, replace all content in the body
          winbox.body.innerHTML = `<div class="winbox-content"><h3 style="color: ${windowTheme.color};">${title}</h3><div style="color: ${windowTheme.color};">${dynamicContent}</div></div>`;
        }
      }
    }, 10);

    return winbox;
  }
}
