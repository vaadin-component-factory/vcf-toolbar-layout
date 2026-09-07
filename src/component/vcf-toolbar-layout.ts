/*-
 * #%L
 *
 * Copyright (C) 2024 - 2025 Vaadin Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * #L%
 */
import { html, LitElement, css, PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { ElementMixin } from '@vaadin/component-base/src/element-mixin.js';
import { I18nMixin } from '@vaadin/component-base/src/i18n-mixin.js';
import { PolylitMixin } from '@vaadin/component-base/src/polylit-mixin.js';
import { ResizeMixin } from '@vaadin/component-base/src/resize-mixin.js';
import { SlotStylesMixin } from '@vaadin/component-base/src/slot-styles-mixin.js';
import { ThemeDetectionMixin } from '@vaadin/vaadin-themable-mixin/vaadin-theme-detection-mixin.js';
import {
  getDeepActiveElement,
  getFocusableElements,
} from '@vaadin/a11y-base/src/focus-utils.js';
import '@vaadin/button';
import '@vaadin/popover';
import '@vaadin/vertical-layout';
// Type-only: `Button` and `Popover` are used solely in type positions, so these
// imports are erased at compile time. The side-effect imports above are what
// actually register the elements and must stay.
import type { Button } from '@vaadin/button';
import type { Popover } from '@vaadin/popover';

/**
 * The object used to localize `<vcf-toolbar-layout>`.
 */
export interface ToolbarLayoutI18n {
  /** Accessible name of the default overflow button. */
  moreOptions?: string;
  /** Accessible name of the overflow popup. */
  overflowMenu?: string;
}

const DEFAULT_I18N: ToolbarLayoutI18n = {
  moreOptions: 'More options',
  overflowMenu: 'More options',
};

/**
 * Whether the (composed) active element is `item` or lives inside it.
 * `item.contains()` alone is not enough: for a text field the active element
 * is the `<input>` inside its shadow root.
 */
function containsDeepActiveElement(item: Element): boolean {
  let node: Node | null = getDeepActiveElement() as Node | null;

  while (node) {
    if (node === item) {
      return true;
    }
    node = node.parentNode ?? (node as ShadowRoot).host ?? null;
  }

  return false;
}

/**
 * Move focus to `item`, or to the first focusable element inside it when the
 * item is a grouping element that is not focusable itself.
 */
function focusItem(item: Element) {
  const [first] = getFocusableElements(item as HTMLElement);
  first?.focus();
}

@customElement('vcf-toolbar-layout')
export class VcfToolbarLayout extends ResizeMixin(
  I18nMixin(
    ElementMixin(SlotStylesMixin(ThemeDetectionMixin(PolylitMixin(LitElement))))
  )
) {
  static get is() {
    return 'vcf-toolbar-layout';
  }

  static get version() {
    return '2.1.0';
  }

  static get styles() {
    return css`
      :host {
        --vcf-toolbar-align-items: baseline;
        --vcf-toolbar-layout-gap: var(--vaadin-gap-xs);

        display: flex;
        align-items: var(--vcf-toolbar-align-items);
        position: relative;
        min-width: 0; /* Allow the host to shrink smaller children */
        overflow: visible; /* Ensure the popover can overflow the host */
        contain: layout;
        width: 100%;
        gap: var(--vcf-toolbar-layout-gap);
      }

      :host([data-application-theme='lumo']) {
        --vcf-toolbar-layout-gap: var(--lumo-space-s);
      }
    `;
  }

  // @ts-expect-error overriding property from `SlotStylesMixinClass`
  override get slotStyles(): string[] {
    const tag = this.localName;
    const lumo = '[data-application-theme="lumo"]';

    // some nested selectors can not be solved with using ::slotted from the shadow root
    // so we need to inject global styles for those parts
    return [
      `
      /* Visually hide the label on icon buttons, but keep it as the button's
         accessible name. "display: none" would remove it from the
         accessibility tree, and since the prefix and suffix parts are
         aria-hidden the button would end up with no name at all. Same
         declarations as the "sr-only" class in
         @vaadin/a11y-base/src/styles/sr-only-styles.js. */
      ${tag} > vaadin-button[theme~="icon"]::part(label) {
        border: 0 !important;
        clip: rect(1px, 1px, 1px, 1px) !important;
        clip-path: inset(50%) !important;
        height: 1px !important;
        margin: -1px !important;
        overflow: hidden !important;
        padding: 0 !important;
        position: absolute !important;
        white-space: nowrap !important;
        width: 1px !important;
      }

      /* Overflow button visibility */
      ${tag} vaadin-button[slot="overflow-button"] {
        display: none;
      }
        
      ${tag} vaadin-button[slot="overflow-button"].visible {
        display: initial;
      }

      /* Overflow container styles */
      ${tag} > .overflow-container {
        --overflow-container-padding: var(--vaadin-padding-xs);
        --overflow-container-item-gap: var(--vaadin-gap-xs);
      
        align-items: stretch;
        gap: var(--overflow-container-item-gap);
        padding: var(--overflow-container-padding);
      }

      ${tag}${lumo} > .overflow-container {
        --overflow-container-padding: var(--lumo-space-s);
        --overflow-container-item-gap: var(--lumo-space-xs);
        --overflow-container-text-color: var(--lumo-body-text-color);
        --overflow-container-prefix-suffix-color: var(--lumo-tertiary-text-color);

        /* vaadin component overrides */
        --vaadin-button-background: transparent;
        --vaadin-button-text-color: var(--lumo-body-text-color);
        --vaadin-button-font-weight: 400;
      }

      ${tag}${lumo}[theme~="fixed-width-prefix"] .overflow-container {
        --overflow-container-prefix-width: var(--lumo-space-l);
      }

      /* native element styles */
      ${tag} > hr {
        display: inline-block;
        flex-shrink: 0;
        align-self: stretch;
        width: 1px;
        height: auto;
        border: none;
        background-color: var(--vaadin-border-color-secondary);
        margin: var(--vaadin-gap-xs);
      }

      ${tag}${lumo} > hr {
        background-color: var(--lumo-contrast-10pct);
        margin: var(--lumo-space-xs);
      }

      ${tag} > hr:first-child,
      ${tag} > hr:last-child {
        visibility: hidden;
        margin: 0;
        margin-right: calc(-1 * var(--vcf-toolbar-layout-gap));
        width: 0;
      }

      ${tag} > .overflow-container > hr:first-child,
      ${tag} > .overflow-container > hr:last-child {
        display: none;
      }

      ${tag} > .overflow-container > hr {
        border: none;
        background-color: var(--vaadin-border-color-secondary);
        margin: 0;
        height: 1px;
        width: 100%;
      }
      
      ${tag}${lumo} > .overflow-container > hr {
        background-color: var(--lumo-contrast-10pct);
      }

      ${tag} > .overflow-container > a {
        display: flex;
        align-items: center;
      }

      /* Vaadin component styles */

      ${tag} > .overflow-container > [has-label]:first-child {
        padding-top: 0;
      }

      ${tag}${lumo} > .overflow-container > [has-label] {
        padding-top: var(--lumo-space-s);
      }
      
      ${tag} > .overflow-container > vaadin-button,
      ${tag} > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button,
      ${tag} > .overflow-container > *::part(input-field) {
        outline-offset: calc(var(--vaadin-focus-ring-width) * -1);
      }
      
      ${tag} > .overflow-container > vaadin-button:not([theme~="error"]):not([theme~="success"]):not([theme~="warning"])::part(prefix),
      ${tag} > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button:not([theme~="error"]):not([theme~="success"]):not([theme~="warning"])::part(prefix),
      ${tag} > .overflow-container > vaadin-button:not([theme~="error"]):not([theme~="success"]):not([theme~="warning"])::part(suffix),
      ${tag} > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button:not([theme~="error"]):not([theme~="success"]):not([theme~="warning"])::part(suffix) {
        color: var(--overflow-container-prefix-suffix-color);
      }

      ${tag} > vaadin-menu-bar > vaadin-menu-bar-button {
        width: unset !important;
      }
      
      /* Workaround for https://github.com/vaadin/web-components/issues/11033 */
      ${tag} > vaadin-menu-bar::part(container) {
        contain: none;
      }
      
      ${tag} > .overflow-container vaadin-menu-bar::part(container) {
        padding: 0;
        margin: 0;
        overflow: visible;
      }

      ${tag} > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button > vaadin-menu-bar-item {
        justify-content: left;
      }

      ${tag}${lumo} > .overflow-container > vaadin-button,
      ${tag}${lumo} > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button {
        --vaadin-button-padding: var(--lumo-space-s);
        --vaadin-button-margin: 0px;
      }

      ${tag} > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button {
        width: unset !important;
        flex: 1;
      }

      ${tag} > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button > vaadin-menu-bar-item {
        width: 100%;
      }

      ${tag}${lumo} > .overflow-container > vaadin-button[theme~="primary"] {
        background: var(--vaadin-button-background);
        color: var(--lumo-primary-text-color);
        font-weight: var(--vaadin-button-font-weight);
      }

      ${tag} > .overflow-container > vaadin-button[theme~="icon"]::part(prefix) {
        margin-left: -0.25em;
        margin-right: 0.25em;
      }

      /* Theme variant to hide prefix & suffix in overflow container */
      ${tag}[theme~="hide-icons"] > .overflow-container > vaadin-button::part(prefix),
      ${tag}[theme~="hide-icons"] > .overflow-container > vaadin-button::part(suffix),
      ${tag}[theme~="hide-icons"] > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button::part(prefix),
      ${tag}[theme~="hide-icons"] > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button::part(suffix) {
        display: none;
      }

      ${tag} > .overflow-container > vaadin-button::part(label),
      ${tag} > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button::part(label) {
        text-align: left;
        flex-grow: 1;
      }

      ${tag}${lumo} > .overflow-container > ::part(input-field) {
        padding: 0 var(--lumo-space-xs);
      }

      ${tag}${lumo} > .overflow-container > a {
        padding: 0 var(--lumo-space-s);
        height: var(--lumo-size-m);
      }

      /* Theme variant forcing horizontal alignment of prefixes */
      ${tag}[theme~="fixed-width-prefix"] > .overflow-container > vaadin-button::part(prefix),
      ${tag}[theme~="fixed-width-prefix"] > .overflow-container > vaadin-menu-bar > vaadin-menu-bar-button::part(prefix) {
        width: var(--overflow-container-prefix-width);
      }

      ${tag}${lumo}[theme~="fixed-width-prefix"] > .overflow-container > a {
        padding-left: calc(var(--lumo-space-s) + 0.2em + var(--overflow-container-prefix-width, 0px));
      }
    `,
    ];
  }

  @property({ type: String, reflect: true })
  theme: string | null = null;

  /**
   * If true, the buttons will be collapsed into the overflow menu
   * starting from the "start" end of the bar instead of the "end".
   * @attr {boolean} reverse-collapse
   */
  @property({ type: Boolean, reflect: true })
  reverseCollapse: boolean = false;

  /**
   * The delay in milliseconds to debounce the overflow update after a resize.
   */
  @property({ type: Number, reflect: true })
  updateDebounceDelay: number = 20;

  /**
   * The object used to localize this component. To change the default
   * localization, replace this with an object that provides all properties, or
   * just the individual properties you want to change.
   *
   * The object has the following JSON structure and default values:
   * ```js
   * {
   *   // Accessible name of the default overflow button
   *   moreOptions: 'More options',
   *   // Accessible name of the overflow popup
   *   overflowMenu: 'More options'
   * }
   * ```
   *
   * Only the default overflow button is labelled. A custom button passed with
   * `slot="overflow-button"` keeps whatever accessible name you give it.
   */
  declare i18n: ToolbarLayoutI18n;

  /** Effective (default-merged) i18n, provided by `I18nMixin`. */
  private declare __effectiveI18n: ToolbarLayoutI18n;

  static get defaultI18n(): ToolbarLayoutI18n {
    return DEFAULT_I18N;
  }

  protected _overflowContainer!: HTMLElement;

  protected _overflowButton!: HTMLElement;

  protected _popover!: Popover;

  private __resizeObserver!: ResizeObserver;

  private __updateTimeout: ReturnType<typeof setTimeout> | null = null;

  /** The overflow button this component created, if the author slotted none. */
  private __defaultOverflowButton?: HTMLElement;

  /** Where focus should land once the current round of moves is finished. */
  private __pendingFocus: HTMLElement | 'overflow-button' | null = null;

  connectedCallback(): void {
    // The guard the rule asks for is dead code here — the base class is always
    // LitElement, and TypeScript rejects the condition with TS2774.
    // eslint-disable-next-line wc/guard-super-call
    super.connectedCallback();

    // listen for resize events
    this.__resizeObserver = new ResizeObserver(
      this._requestOverflowUpdate.bind(this)
    );
    this.__resizeObserver.observe(this);
  }

  disconnectedCallback(): void {
    // eslint-disable-next-line wc/guard-super-call -- see connectedCallback
    super.disconnectedCallback();

    // remove resize observer
    this.__resizeObserver.disconnect();

    // clear any pending update
    if (this.__updateTimeout) {
      clearTimeout(this.__updateTimeout);
      this.__updateTimeout = null;
    }
  }

  protected firstUpdated() {
    // get the overflow button (or create it)
    this._overflowButton = this._findOrCreateOverflowButton();

    // setup overflow container
    this._overflowContainer = document.createElement('vaadin-vertical-layout');
    this._overflowContainer.classList.add('overflow-container');
    this._overflowContainer.slot = 'overflow-content';
    this.append(this._overflowContainer);

    // setup the popover
    this._popover = this.shadowRoot!.querySelector('vaadin-popover') as Popover;
    this._popover.target = this._overflowButton;

    // process overflow items to set initial state
    // for some reason, button width is ignored unless we need to wait for the next frame
    setTimeout(() => this._updateOverflowingItems(), 0);
  }

  protected _findOrCreateOverflowButton() {
    let button = this.querySelector(
      '[slot="overflow-button"]'
    ) as HTMLElement | null;

    // create default overflow button if not found
    if (!button) {
      button =
        this.__defaultOverflowButton ?? this._createDefaultOverflowButton();
      this.__defaultOverflowButton = button;
      this.appendChild(button);
    }

    return button;
  }

  /**
   * Whether the current overflow button is the one this component created.
   * Compared by identity: once appended, the default button is itself matched
   * by the `[slot="overflow-button"]` selector, so a selector-based check
   * would report every button as custom.
   */
  protected get _isDefaultOverflowButton(): boolean {
    return (
      !!this.__defaultOverflowButton &&
      this._overflowButton === this.__defaultOverflowButton
    );
  }

  // Does not use `this`, but stays a method: it is a `protected` override point
  // for subclasses that want a different overflow button.
  // eslint-disable-next-line class-methods-use-this
  protected _createDefaultOverflowButton() {
    const button = document.createElement('vaadin-button') as Button;
    button.setAttribute('slot', 'overflow-button');
    button.setAttribute('theme', 'icon');
    // The popover sets this on its target too, but setting it here means the
    // button is correct from creation. Keep in sync with the popover's role.
    button.setAttribute('aria-haspopup', 'dialog');
    button.innerHTML =
      '<vaadin-icon icon="vaadin:ellipsis-dots-v" slot="suffix"></vaadin-icon>';
    return button;
  }

  render() {
    return html`
      <slot></slot>
      <slot name="menu"></slot>
      <slot
        name="overflow-button"
        @slotchange="${this._onOverflowButtonSlotChange}"
      >
      </slot>

      <vaadin-popover
        part="popover"
        theme="no-padding ${this.theme}"
        modal="true"
        position="bottom-start"
        role="dialog"
        aria-label="${this.__effectiveI18n.overflowMenu ?? ''}"
      >
        <slot name="overflow-content"></slot>
      </vaadin-popover>
    `;
  }

  protected updated(props: PropertyValues) {
    super.updated(props);

    if (props.has('__effectiveI18n')) {
      this._updateOverflowButtonAriaLabel();
    }
  }

  /**
   * Apply the localized accessible name to the default overflow button. A
   * custom button passed with `slot="overflow-button"` is left untouched.
   */
  protected _updateOverflowButtonAriaLabel() {
    if (!this._overflowButton || !this._isDefaultOverflowButton) {
      return;
    }

    const label = this.__effectiveI18n.moreOptions;
    if (label) {
      this._overflowButton.setAttribute('aria-label', label);
    } else {
      this._overflowButton.removeAttribute('aria-label');
    }
  }

  /**
   * Fired when the overflow button slot changes. This is likely because
   * a new overflow button was added or the existing one was removed.
   */
  protected _onOverflowButtonSlotChange() {
    // update our reference to new overflow button
    this._overflowButton = this._findOrCreateOverflowButton();

    // update the popover target to the new overflow button
    this._popover.target = this._overflowButton;

    // the default button is appended after `updated()` has already run, so
    // its accessible name has to be (re-)applied here
    this._updateOverflowButtonAriaLabel();

    // depending on the state of the overflow items, we may need to the new button to immediately be visible
    this._updateOverflowButtonState();
  }

  /**
   * Request an update to the overflow items. This method debounces the update.
   */
  protected _requestOverflowUpdate() {
    if (this.__updateTimeout) {
      clearTimeout(this.__updateTimeout);
    }
    this.__updateTimeout = setTimeout(
      () => this._updateOverflowingItems(),
      this.updateDebounceDelay
    );
  }

  /**
   * Move elements between the main container and the overflow container.
   * Elements in the main container are visisble as normal.
   * Elements in the overflow container are hidden and only shown when the overflow button is clicked.
   */
  protected _updateOverflowingItems() {
    const popoverWasOpened = !!this._popover?.opened;
    const previouslyOverflowed = this._getOverflowedItems();

    // todo: include container gap/padding/etc value in calculation?
    const overflowButtonWidth = this._overflowButton
      ? this._overflowButton.getBoundingClientRect().width
      : 0;

    const visibleItems = this._getVisibleItems();
    const lastVisibleItem =
      visibleItems.length > 0 ? visibleItems[visibleItems.length - 1] : null;

    const overflowedItems = this._getOverflowedItems();

    // if the right-most item is visible in the container, then we might need to move overflow items back into the main container
    if (
      !lastVisibleItem ||
      this._isElementVisibleInContainer(
        lastVisibleItem,
        this,
        overflowButtonWidth
      )
    ) {
      while (overflowedItems.length > 0) {
        // temporarily move the item to the main container, then check for clipping
        const overflowedItem = this.reverseCollapse
          ? overflowedItems[overflowedItems.length - 1]
          : overflowedItems[0];
        this._moveItemToMainContainer(overflowedItem);

        // check the right-most visible item for clipping
        const updatedVisibleItems = this._getVisibleItems(); // <-- not optimal, but we need to get the updated list of visible items
        const lastItem = this.reverseCollapse
          ? updatedVisibleItems[updatedVisibleItems.length - 1]
          : overflowedItem;
        if (
          !this._isElementVisibleInContainer(
            lastItem,
            this,
            overflowButtonWidth
          )
        ) {
          this._moveItemToOverflowContainer(overflowedItem);
          break;
        }

        // remove from the overflowed items
        overflowedItems.splice(overflowedItems.indexOf(overflowedItem), 1);
      }
    } else {
      // move items from the main container to the overflow container if they are clipped
      // loop in reverse so that the right-most item is checked first
      while (visibleItems.length > 0) {
        let item = visibleItems[visibleItems.length - 1];

        // normally we need to add the overflow button width, since the button sits to the right of the items,
        // but in reverse collapse mode, if the button is visible, it is on the left so we don't need to add its width
        const extraSpaceRequired =
          this.reverseCollapse && this._isOverflowButtonVisible()
            ? 0
            : overflowButtonWidth;
        if (this._isElementVisibleInContainer(item, this, extraSpaceRequired)) {
          break;
        }

        // if reverse collapse mode, we actually move the left-most item to the overflow container instead
        item = this.reverseCollapse ? visibleItems[0] : item;

        // move item to overflow container
        this._moveItemToOverflowContainer(item);

        // remove from the visible items
        visibleItems.splice(visibleItems.indexOf(item), 1);
      }
    }

    // show the overflow button if there are items in the overflow container.
    // must happen before focusing it: it is `display: none` until then.
    this._updateOverflowButtonState();

    const pendingFocus = this.__pendingFocus;
    this.__pendingFocus = null;

    if (popoverWasOpened && this.__overflowSetChanged(previouslyOverflowed)) {
      // don't leave a stale popup listing items that have moved. Closing
      // restores focus to the overflow button on its own, via the popover's
      // `restoreFocusOnClose`.
      this._popover.opened = false;
      return;
    }

    if (pendingFocus === 'overflow-button') {
      this._overflowButton.focus();
    } else if (pendingFocus) {
      focusItem(pendingFocus);
    }
  }

  private __overflowSetChanged(previous: Element[]): boolean {
    const current = this._getOverflowedItems();

    return (
      current.length !== previous.length ||
      current.some((item, index) => item !== previous[index])
    );
  }

  /**
   * Check if the element is visible in the container.
   * @param element
   * @param container
   * @param extraSpaceRequired
   * @returns
   */
  // Does not use `this`, but stays a method: it is a `protected` override point
  // for subclasses that measure visibility differently.
  // eslint-disable-next-line class-methods-use-this
  protected _isElementVisibleInContainer(
    element: Element,
    container: Element,
    extraSpaceRequired: number = 0
  ): boolean {
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return (
      // elementRect.top >= containerRect.top &&
      // elementRect.left >= containerRect.left &&
      // elementRect.bottom <= containerRect.bottom &&
      elementRect.right + extraSpaceRequired <= containerRect.right
    );
  }

  protected _getVisibleItems(): Element[] {
    return Array.from(this.querySelectorAll(':scope > *:not([slot])'));
  }

  protected _getOverflowedItems(): Element[] {
    return Array.from(this._overflowContainer.querySelectorAll(':scope > *'));
  }

  protected _moveItemToOverflowContainer(item: Element) {
    // the item is about to be detached, and inside the closed popover it is
    // `display: none`. Without this, focus would fall back to <body>.
    // Resolved once, after all moves, in `_updateOverflowingItems()`.
    if (containsDeepActiveElement(item)) {
      this.__pendingFocus = 'overflow-button';
    }

    item.remove();

    if (this.reverseCollapse) {
      // if reverse collapse mode, we need to insert at the end of the overflow container
      this._overflowContainer.appendChild(item);
    } else {
      // must insert at beginning of overflow container to ensure order stays consistent with normal menu
      this._overflowContainer.insertBefore(
        item,
        this._overflowContainer.firstChild
      );
    }
  }

  protected _moveItemToMainContainer(item: Element) {
    if (containsDeepActiveElement(item)) {
      this.__pendingFocus = item as HTMLElement;
    }

    item.remove();

    if (this.reverseCollapse) {
      // if reverse collapse mode, we need to insert at the beginning of the main container
      this.insertBefore(item, this.children[0]);
    } else {
      // must insert at end of main container to ensure order stays consistent with normal menu
      this.appendChild(item);
    }
  }

  /**
   * Refresh the overflow button's state.
   */
  protected _updateOverflowButtonState() {
    if (this._getOverflowedItems().length > 0) {
      this._overflowButton.classList.add('visible');
    } else {
      this._overflowButton.classList.remove('visible');
    }
  }

  protected _isOverflowButtonVisible(): boolean {
    return this._overflowButton.classList.contains('visible');
  }
}
