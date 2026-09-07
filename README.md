# `<vcf-toolbar-layout>`

`<vcf-toolbar-layout>` is a LitElement‑based web component that manages overflowing menu items. It automatically moves overflowing items into a dedicated overflow popover, and it supports keyboard navigation, customizable theming, and grouping of items. While it works best with [Vaadin web components](https://vaadin.com/components), it supports any elements you choose to use.

## Features

- **Overflow Handling:**  
  Automatically moves overflowing menu items into a dedicated popover.
- **Configurable Collapse Debounce:**  
  The `updateDebounceDelay` property sets the debounce delay (in milliseconds) from when a resize event occurs until the overflow items are updated.
- **Reverse Collapse:**  
  When the `reverse-collapse` attribute is set, the component collapses items from the left side instead of the right.
- **Theming:**  
  Two additional themes are provided (applied via the `theme` attribute):
  - **`fixed-width-prefix`** – aligns overflow popover items uniformly regardless of whether they include a prefix icon.
  - **`hide-icons`** – automatically hides icons on items within the overflow popover.
- **Keyboard & Screen Reader Support:**  
  Each item is its own tab stop. The overflow popup is a modal dialog: it traps
  focus, moves focus into itself when opened, closes on `Escape` and returns
  focus to the overflow button. When a focused item collapses into the overflow,
  focus moves to the overflow button instead of being lost.
- **Localization:**  
  The `i18n` property localizes the accessible names of the overflow button and
  the overflow popup.
- **Grouping Items:**  
  Group items by passing in a layout/container element; grouped items collapse and display together in the overflow popover.

## Installation

Install the component via npm:

```bash
npm install @vaadin-component-factory/vcf-toolbar-layout
```

## Usage

After installing, import the component into your application:

```js
import '@vaadin-component-factory/vcf-toolbar-layout';
```

### Basic Usage

```html
<vcf-toolbar-layout>
  <vaadin-button>Button 1</vaadin-button>
  <vaadin-button>Button 2</vaadin-button>
  <vaadin-button>Button 3</vaadin-button>
</vcf-toolbar-layout>
```

### Custom Overflow Button

```html
<vcf-toolbar-layout>
  <vaadin-button slot="overflow-button">View overflow items</vaadin-button>
</vcf-toolbar-layout>
```

The component only labels the overflow button it creates itself. A custom
overflow button keeps whatever accessible name you give it, so an icon-only one
needs an explicit `aria-label`:

```html
<vcf-toolbar-layout>
  <vaadin-button slot="overflow-button" theme="icon" aria-label="More options">
    <vaadin-icon icon="vaadin:ellipsis-dots-v" slot="suffix"></vaadin-icon>
  </vaadin-button>
</vcf-toolbar-layout>
```

### Reverse Collapse and Debounce Delay

```html
<vcf-toolbar-layout reverse-collapse update-debounce-delay="100">
  <vaadin-button>Left 1</vaadin-button>
  <vaadin-button>Left 2</vaadin-button>
</vcf-toolbar-layout>
```

### Grouped Items

```html
<vcf-toolbar-layout>
  <div>
    <vaadin-button>Grouped A</vaadin-button>
    <vaadin-button>Grouped B</vaadin-button>
  </div>
  <vaadin-button>Solo</vaadin-button>
</vcf-toolbar-layout>
```

### Theming

#### Fixed Width Prefix

```html
<vcf-toolbar-layout theme="fixed-width-prefix">
  <vaadin-button theme="icon">
    <vaadin-icon icon="vaadin:edit" slot="prefix"></vaadin-icon>
    Edit
  </vaadin-button>
  <vaadin-button>
    Save
  </vaadin-button>
</vcf-toolbar-layout>
```

#### Hide Icons

```html
<vcf-toolbar-layout theme="hide-icons">
  <vaadin-button theme="icon">
    <vaadin-icon icon="vaadin:trash" slot="prefix"></vaadin-icon>
    Delete
  </vaadin-button>
  <vaadin-button theme="icon">
    <vaadin-icon icon="vaadin:download" slot="prefix"></vaadin-icon>
    Download
  </vaadin-button>
</vcf-toolbar-layout>
```

## Property Details

- **`reverseCollapse` (Boolean):**  
  When set (or used as the `reverse-collapse` attribute), the component collapses items from the left side.

- **`updateDebounceDelay` (Number):**  
  Sets the debounce delay (in milliseconds) from when a resize event occurs until the overflow items are updated—useful for managing performance during rapid resizes.

- **`i18n` (Object):**  
  Localizes the component's accessible names. Assign the whole object or just
  the properties you want to change—partial objects are merged with the
  defaults.

  ```js
  {
    // Accessible name of the default overflow button
    moreOptions: 'More options',
    // Accessible name of the overflow popup
    overflowMenu: 'More options'
  }
  ```

  ```js
  document.querySelector('vcf-toolbar-layout').i18n = {
    moreOptions: "Plus d'options"
  };
  ```

## Running the Demo

Clone the repository and install dependencies:

```bash
npm install
npm start
```

A demo page will launch in your browser, showcasing how `<vcf-toolbar-layout>` handles overflow, reverse collapse, theming, grouping, and keyboard navigation.

## Publishing a New Version

Releases are published manually from `main`—there is no CI release workflow. You
need write access to the repository and publish rights on the
[`@vaadin-component-factory`](https://www.npmjs.com/org/vaadin-component-factory)
npm organization.

1. Start from an up-to-date, clean `main`:

   ```bash
   git switch main && git pull
   ```

2. Bump the version in **both** places—they must stay in sync:
   - `version` in `package.json`
   - the `static get version()` getter in `src/component/vcf-toolbar-layout.ts`

3. Build and verify:

   ```bash
   npm ci
   npm run build
   npm run lint
   npm test
   ```

   Run `npm run build` explicitly: the package's `prepublish` script is not
   executed by `npm publish` (since npm 5 that hook only runs on `npm install`),
   so publishing without it would ship a stale `dist/`.

4. Commit and tag. Tags are the bare version, **without** a `v` prefix, so
   create the tag by hand rather than with `npm version`:

   ```bash
   git commit -a -m "build: update version to 2.0.4"
   git tag 2.0.4
   git push origin main --follow-tags
   ```

5. Publish to npm:

   ```bash
   npm login          # check with: npm whoami
   npm publish --access public
   ```

6. Create the GitHub release from the tag:

   ```bash
   gh release create 2.0.4 --generate-notes
   ```

Use a patch version for fixes, a minor version for new features, and a major
version for breaking changes or a new Vaadin platform baseline.

## Contributing

Contributions are welcome! Please review our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

Distributed under the Apache License 2.0. See [LICENSE](LICENSE) for details.

## Sponsored Development

Major pieces of this component’s development have been sponsored by multiple Vaadin customers. Learn more about our support and pricing at [Vaadin Pricing](https://vaadin.com/pricing).