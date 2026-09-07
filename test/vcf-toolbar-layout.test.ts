import { aTimeout, expect, fixture, html, nextFrame } from '@open-wc/testing';
import { getDeepActiveElement } from '@vaadin/a11y-base/src/focus-utils.js';
import type { Popover } from '@vaadin/popover';
import '@vaadin/button';
import '../src/component/vcf-toolbar-layout.js';
import type { VcfToolbarLayout } from '../src/component/vcf-toolbar-layout.js';

/** Reach into the component's protected members from tests. */
type Internals = {
  _popover: Popover;
  _overflowButton: HTMLElement;
  _updateOverflowingItems(): void;
};

function internals(layout: VcfToolbarLayout): Internals {
  return layout as unknown as Internals;
}

function popoverOf(layout: VcfToolbarLayout): Popover {
  return layout.shadowRoot!.querySelector('vaadin-popover') as Popover;
}

function overflowButtonOf(layout: VcfToolbarLayout): HTMLElement {
  return internals(layout)._overflowButton;
}

function visibleItems(layout: VcfToolbarLayout): Element[] {
  return Array.from(layout.querySelectorAll(':scope > *:not([slot])'));
}

function overflowedItems(layout: VcfToolbarLayout): Element[] {
  return Array.from(
    layout.querySelectorAll(':scope > .overflow-container > *')
  );
}

/**
 * The first overflow measurement is deferred with `setTimeout(…, 0)` and
 * resize-driven updates are debounced, so give both a chance to run.
 */
async function settle(layout: VcfToolbarLayout) {
  layout.updateDebounceDelay = 0;
  await nextFrame();
  await aTimeout(0);
  await nextFrame();
  await aTimeout(0);
}

async function resize(layout: VcfToolbarLayout, width: string) {
  layout.style.width = width;
  await settle(layout);
}

/** Open the popup the way a user does — the popover's default trigger is click. */
async function openPopup(layout: VcfToolbarLayout) {
  overflowButtonOf(layout).click();
  await nextFrame();
  await aTimeout(0);
}

async function createLayout(width = '1000px') {
  const layout = await fixture<VcfToolbarLayout>(html`
    <vcf-toolbar-layout style="width: ${width}">
      <vaadin-button>First</vaadin-button>
      <vaadin-button>Second</vaadin-button>
      <vaadin-button>Third</vaadin-button>
      <vaadin-button>Fourth</vaadin-button>
      <vaadin-button>Fifth</vaadin-button>
    </vcf-toolbar-layout>
  `);
  await settle(layout);
  return layout;
}

describe('vcf-toolbar-layout accessibility', () => {
  describe('overflow popup semantics', () => {
    let layout: VcfToolbarLayout;
    let popover: Popover;

    beforeEach(async () => {
      layout = await createLayout();
      popover = popoverOf(layout);
    });

    it('is a dialog, not a menu', () => {
      expect(popover.getAttribute('role')).to.equal('dialog');
    });

    it('does not claim menu semantics it cannot honour', () => {
      // no menuitem children, no arrow-key navigation, no type-ahead
      expect(popover.getAttribute('role')).to.not.equal('menu');
      expect(popover.hasAttribute('overlay-role')).to.be.false;
    });

    it('has an accessible name', () => {
      expect(popover.getAttribute('aria-label')).to.equal('More options');
    });

    it('has no dangling aria-labelledby', () => {
      // regression: `accessible-name-ref` used to write a non-id string here
      expect(popover.hasAttribute('aria-labelledby')).to.be.false;
      expect(popover.hasAttribute('accessible-name-ref')).to.be.false;
    });

    it('is modal', () => {
      expect(popover.getAttribute('aria-modal')).to.equal('true');
    });
  });

  describe('overflow button', () => {
    let layout: VcfToolbarLayout;

    beforeEach(async () => {
      layout = await createLayout();
    });

    it('has a localizable accessible name', () => {
      expect(overflowButtonOf(layout).getAttribute('aria-label')).to.equal(
        'More options'
      );
    });

    it('describes the popup it opens', () => {
      const button = overflowButtonOf(layout);
      expect(button.getAttribute('aria-haspopup')).to.equal('dialog');
      expect(button.getAttribute('aria-expanded')).to.equal('false');
      expect(button.getAttribute('aria-controls')).to.equal(
        popoverOf(layout).id
      );
      expect(popoverOf(layout).id).to.not.be.empty;
    });

    it('reports the expanded state', async () => {
      await resize(layout, '200px');
      await openPopup(layout);

      expect(internals(layout)._popover.opened).to.be.true;
      expect(overflowButtonOf(layout).getAttribute('aria-expanded')).to.equal(
        'true'
      );
    });
  });

  describe('i18n', () => {
    let layout: VcfToolbarLayout;

    beforeEach(async () => {
      layout = await createLayout();
    });

    it('defaults both names to "More options"', () => {
      expect(layout.i18n.moreOptions).to.equal('More options');
      expect(layout.i18n.overflowMenu).to.equal('More options');
    });

    it('translates the overflow button name', async () => {
      layout.i18n = { moreOptions: 'Plus doptions' };
      await nextFrame();
      expect(overflowButtonOf(layout).getAttribute('aria-label')).to.equal(
        'Plus doptions'
      );
    });

    it('translates the popup name', async () => {
      layout.i18n = { overflowMenu: 'Elements masques' };
      await nextFrame();
      expect(popoverOf(layout).getAttribute('aria-label')).to.equal(
        'Elements masques'
      );
    });

    it('merges partial overrides with the defaults', async () => {
      layout.i18n = { moreOptions: 'Plus doptions' };
      await nextFrame();
      expect(popoverOf(layout).getAttribute('aria-label')).to.equal(
        'More options'
      );
    });
  });

  describe('custom overflow button', () => {
    it('keeps the accessible name the author gave it', async () => {
      const layout = await fixture<VcfToolbarLayout>(html`
        <vcf-toolbar-layout style="width: 1000px">
          <vaadin-button>First</vaadin-button>
          <vaadin-button>Second</vaadin-button>
          <vaadin-button slot="overflow-button" aria-label="Show the rest">
            More
          </vaadin-button>
        </vcf-toolbar-layout>
      `);
      await settle(layout);

      expect(overflowButtonOf(layout).getAttribute('aria-label')).to.equal(
        'Show the rest'
      );

      layout.i18n = { moreOptions: 'Plus doptions' };
      await nextFrame();

      expect(overflowButtonOf(layout).getAttribute('aria-label')).to.equal(
        'Show the rest'
      );
    });
  });

  describe('focus management', () => {
    it('moves focus to the overflow button when the focused item collapses', async () => {
      const layout = await createLayout();
      expect(overflowedItems(layout)).to.be.empty;

      const items = visibleItems(layout);
      const last = items[items.length - 1] as HTMLElement;
      last.focus();
      expect(getDeepActiveElement()).to.equal(last);

      await resize(layout, '120px');

      expect(overflowedItems(layout)).to.include(last);
      expect(getDeepActiveElement()).to.not.equal(document.body);
      expect(getDeepActiveElement()).to.equal(overflowButtonOf(layout));
    });

    it('leaves focus alone when an unfocused item collapses', async () => {
      const layout = await createLayout();
      const first = visibleItems(layout)[0] as HTMLElement;
      first.focus();

      await resize(layout, '120px');

      expect(getDeepActiveElement()).to.equal(first);
    });

    it('closes the popup when the overflow set changes while it is open', async () => {
      const layout = await createLayout();
      await resize(layout, '200px');
      expect(overflowedItems(layout)).to.not.be.empty;

      await openPopup(layout);
      const popover = internals(layout)._popover;
      expect(popover.opened).to.be.true;

      await resize(layout, '80px');

      expect(popover.opened).to.be.false;
    });

    it('keeps the popup open when the overflow set is unchanged', async () => {
      const layout = await createLayout();
      await resize(layout, '200px');

      await openPopup(layout);
      const popover = internals(layout)._popover;
      const before = overflowedItems(layout);

      // re-measure without changing the width
      internals(layout)._updateOverflowingItems();
      await nextFrame();

      expect(overflowedItems(layout)).to.eql(before);
      expect(popover.opened).to.be.true;
    });
  });

  describe('icon buttons', () => {
    it('keeps the label in the accessibility tree while in the row', async () => {
      const layout = await fixture<VcfToolbarLayout>(html`
        <vcf-toolbar-layout style="width: 1000px">
          <vaadin-button theme="icon">Remove</vaadin-button>
        </vcf-toolbar-layout>
      `);
      await settle(layout);

      const button = layout.querySelector(
        'vaadin-button[theme~="icon"]'
      ) as HTMLElement;
      const label = button.shadowRoot!.querySelector(
        '[part="label"]'
      ) as HTMLElement;

      // `display: none` would drop the button's only nameable content, since
      // the prefix and suffix parts are aria-hidden
      expect(getComputedStyle(label).display).to.not.equal('none');
      expect(getComputedStyle(label).visibility).to.not.equal('hidden');
    });

    it('keeps the label out of the layout, whatever its length', async () => {
      const layout = await fixture<VcfToolbarLayout>(html`
        <vcf-toolbar-layout style="width: 1000px">
          <vaadin-button theme="icon" id="no-label"></vaadin-button>
          <vaadin-button theme="icon" id="short-label">Remove</vaadin-button>
          <vaadin-button theme="icon" id="long-label">
            A very much longer label indeed
          </vaadin-button>
        </vcf-toolbar-layout>
      `);
      await settle(layout);

      const widthOf = (id: string) =>
        (layout.querySelector(`#${id}`) as HTMLElement).getBoundingClientRect()
          .width;

      // the screen-reader-only label must not take up layout space, or icon
      // buttons would grow to fit text that is not shown
      expect(widthOf('short-label')).to.be.closeTo(widthOf('no-label'), 1);
      expect(widthOf('long-label')).to.be.closeTo(widthOf('no-label'), 1);
    });
  });
});
