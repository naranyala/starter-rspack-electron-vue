export class DOMUtils {
  static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes: Record<string, unknown> = {},
    children: (string | Node)[] = []
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = String(value);
      } else if (key === 'innerHTML') {
        element.innerHTML = String(value);
      } else if (key === 'textContent') {
        element.textContent = String(value);
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, String(value));
      } else if (key.startsWith('on') && typeof value === 'function') {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value as EventListener);
      } else if (key in element) {
        (element as unknown as Record<string, unknown>)[key] = value;
      } else {
        element.setAttribute(key, String(value));
      }
    });

    children.forEach((child) => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });

    return element;
  }

  static find<K extends keyof HTMLElementTagNameMap>(
    selector: string,
    parent: ParentNode = document
  ): HTMLElementTagNameMap[K] | null {
    return parent.querySelector(selector);
  }

  static findAll<K extends keyof HTMLElementTagNameMap>(
    selector: string,
    parent: ParentNode = document
  ): NodeListOf<HTMLElementTagNameMap[K]> {
    return parent.querySelectorAll(selector);
  }

  static on(
    element: HTMLElement,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): () => void {
    element.addEventListener(event, handler, options);
    return () => element.removeEventListener(event, handler, options);
  }

  static off(
    element: HTMLElement,
    event: string,
    handler: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.removeEventListener(event, handler, options);
  }

  static addClass(element: HTMLElement, className: string): void {
    element.classList.add(className);
  }

  static removeClass(element: HTMLElement, className: string): void {
    element.classList.remove(className);
  }

  static toggleClass(element: HTMLElement, className: string): boolean {
    return element.classList.toggle(className);
  }

  static hasClass(element: HTMLElement, className: string): boolean {
    return element.classList.contains(className);
  }

  static show(element: HTMLElement, display: string = 'block'): void {
    element.style.display = display;
  }

  static hide(element: HTMLElement): void {
    element.style.display = 'none';
  }

  static visible(element: HTMLElement, visible: boolean): void {
    element.style.visibility = visible ? 'visible' : 'hidden';
  }

  static remove(element: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }

  static empty(element: HTMLElement): void {
    element.innerHTML = '';
  }

  static replace(element: HTMLElement, newElement: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.replaceChild(newElement, element);
    }
  }

  static before(element: HTMLElement, newElement: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.insertBefore(newElement, element);
    }
  }

  static after(element: HTMLElement, newElement: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.insertBefore(newElement, element.nextSibling);
    }
  }

  static wrap(element: HTMLElement, wrapper: HTMLElement): void {
    if (element.parentNode) {
      element.parentNode.insertBefore(wrapper, element);
      wrapper.appendChild(element);
    }
  }

  static unwrap(element: HTMLElement): void {
    const parent = element.parentNode;
    if (parent && parent !== document.body) {
      const grandparent = parent.parentNode;
      if (grandparent) {
        while (element.firstChild) {
          grandparent.insertBefore(element.firstChild, parent);
        }
        grandparent.removeChild(parent);
      }
    }
  }

  static getData(element: HTMLElement, key: string): string | null {
    return element.getAttribute(`data-${key}`);
  }

  static setData(element: HTMLElement, key: string, value: string): void {
    element.setAttribute(`data-${key}`, value);
  }

  static removeData(element: HTMLElement, key: string): void {
    element.removeAttribute(`data-${key}`);
  }

  static offset(element: HTMLElement): { top: number; left: number } {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
    };
  }

  static position(element: HTMLElement): { top: number; left: number } {
    return {
      top: element.offsetTop,
      left: element.offsetLeft,
    };
  }

  static outerHeight(element: HTMLElement, includeMargin: boolean = false): number {
    let height = element.offsetHeight;
    if (includeMargin) {
      const style = window.getComputedStyle(element);
      height += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
    }
    return height;
  }

  static outerWidth(element: HTMLElement, includeMargin: boolean = false): number {
    let width = element.offsetWidth;
    if (includeMargin) {
      const style = window.getComputedStyle(element);
      width += parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10);
    }
    return width;
  }

  static scrollTop(element: HTMLElement | Window, value?: number): number {
    if (element instanceof Window) {
      if (value !== undefined) {
        element.scrollTo(0, value);
      }
      return window.scrollY;
    }
    if (value !== undefined) {
      element.scrollTop = value;
    }
    return element.scrollTop;
  }

  static scrollLeft(element: HTMLElement | Window, value?: number): number {
    if (element instanceof Window) {
      if (value !== undefined) {
        element.scrollTo(value, 0);
      }
      return window.scrollX;
    }
    if (value !== undefined) {
      element.scrollLeft = value;
    }
    return element.scrollLeft;
  }
}

export class AnimationUtils {
  static fadeIn(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.opacity = '0';
      element.style.display = 'block';
      element.style.transition = `opacity ${duration}ms ease`;

      requestAnimationFrame(() => {
        element.style.opacity = '1';
        setTimeout(resolve, duration);
      });
    });
  }

  static fadeOut(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease`;

      requestAnimationFrame(() => {
        element.style.opacity = '0';
        setTimeout(() => {
          element.style.display = 'none';
          resolve();
        }, duration);
      });
    });
  }

  static fadeTo(element: HTMLElement, opacity: number, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.transition = `opacity ${duration}ms ease`;
      element.style.opacity = String(opacity);
      setTimeout(resolve, duration);
    });
  }

  static slideDown(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      element.style.height = '0';
      element.style.display = 'block';
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease`;

      const targetHeight = element.scrollHeight;
      requestAnimationFrame(() => {
        element.style.height = `${targetHeight}px`;
        setTimeout(() => {
          element.style.height = '';
          element.style.overflow = '';
          resolve();
        }, duration);
      });
    });
  }

  static slideUp(element: HTMLElement, duration: number = 300): Promise<void> {
    return new Promise((resolve) => {
      const originalHeight = element.offsetHeight;
      element.style.height = `${originalHeight}px`;
      element.style.overflow = 'hidden';
      element.style.transition = `height ${duration}ms ease`;

      requestAnimationFrame(() => {
        element.style.height = '0';
        setTimeout(() => {
          element.style.display = 'none';
          element.style.height = '';
          element.style.overflow = '';
          resolve();
        }, duration);
      });
    });
  }

  static slideToggle(element: HTMLElement, duration: number = 300): Promise<void> {
    if (element.style.display === 'none') {
      return AnimationUtils.slideDown(element, duration);
    }
    return AnimationUtils.slideUp(element, duration);
  }

  static animate(
    element: HTMLElement,
    properties: Record<string, string | number>,
    duration: number = 300,
    easing: string = 'ease'
  ): Promise<void> {
    return new Promise((resolve) => {
      const transition = Object.keys(properties)
        .map((key) => `${AnimationUtils.camelToKebab(key)} ${duration}ms ${easing}`)
        .join(', ');

      element.style.transition = transition;

      requestAnimationFrame(() => {
        Object.entries(properties).forEach(([key, value]) => {
          (element.style as unknown as Record<string, string>)[key] = String(value);
        });
        setTimeout(resolve, duration);
      });
    });
  }

  private static camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  static stop(element: HTMLElement): void {
    element.style.transition = '';
  }

  static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
