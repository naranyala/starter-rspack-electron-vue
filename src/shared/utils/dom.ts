/**
 * DOM utilities for renderer process
 */

interface ElementAttributes {
  [key: string]: unknown;
}

export class DOMUtils {
  static createElement(
    tagName: string,
    attributes: ElementAttributes = {},
    children: (string | HTMLElement)[] = []
  ): HTMLElement {
    const element = document.createElement(tagName);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value as string;
      } else if (key === 'innerHTML') {
        element.innerHTML = value as string;
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, value as string);
      } else {
        (element as unknown as Record<string, unknown>)[key] = value;
      }
    });

    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });

    return element;
  }

  /**
   * Find element by selector
   * @param selector - CSS selector
   * @param parent - Parent element (default: document)
   * @returns Found element or null
   */
  static find(selector: string, parent: ParentNode = document): HTMLElement | null {
    return parent.querySelector(selector);
  }

  /**
   * Find all elements by selector
   * @param selector - CSS selector
   * @param parent - Parent element (default: document)
   * @returns Found elements
   */
  static findAll(selector: string, parent: ParentNode = document): NodeListOf<HTMLElement> {
    return parent.querySelectorAll<HTMLElement>(selector);
  }

  /**
   * Add event listener with automatic cleanup
   * @param element - Target element
   * @param event - Event name
   * @param handler - Event handler
   * @param options - Event options
   * @returns Cleanup function
   */
  static on(
    element: HTMLElement,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): () => void {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  }

  /**
   * Add CSS class to element
   * @param element - Target element
   * @param className - Class name to add
   */
  static addClass(element: HTMLElement, className: string): void {
    element.classList.add(className);
  }

  /**
   * Remove CSS class from element
   * @param element - Target element
   * @param className - Class name to remove
   */
  static removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
  }

  /**
   * Toggle CSS class on element
   * @param element - Target element
   * @param className - Class name to toggle
   * @returns Whether class is now present
   */
  static toggleClass(element: HTMLElement, className: string): boolean {
    return element.classList.toggle(className);
  }

  /**
   * Check if element has CSS class
   * @param element - Target element
   * @param className - Class name to check
   * @returns Whether class is present
   */
  static hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }
}

/**
 * Animation utilities
 */
export class AnimationUtils {
  /**
   * Fade in element
   * @param element - Target element
   * @param duration - Animation duration in ms
   * @returns Animation promise
   */
  static fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.display = 'block';

      const start = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        element.style.opacity = progress.toString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Fade out element
   * @param element - Target element
   * @param duration - Animation duration in ms
   * @returns Animation promise
   */
  static fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        element.style.opacity = (1 - progress).toString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.display = 'none';
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }

  /**
   * Slide element in from top
   * @param element - Target element
   * @param duration - Animation duration in ms
   * @returns Animation promise
   */
  static slideInFromTop(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.transform = 'translateY(-100%)';
      element.style.display = 'block';

      const start = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        element.style.transform = `translateY(${(1 - progress) * -100}%)`;

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          element.style.transform = '';
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  }
}
