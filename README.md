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
- **Keyboard Navigation:**  
  Complete keyboard support for menu navigation.
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

## Running the Demo

Clone the repository and install dependencies:

```bash
npm install
npm start
```

A demo page will launch in your browser, showcasing how `<vcf-toolbar-layout>` handles overflow, reverse collapse, theming, grouping, and keyboard navigation.

## Contributing

Contributions are welcome! Please review our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

Distributed under the Apache License 2.0. See [LICENSE](LICENSE) for details.

## Sponsored Development

Major pieces of this component’s development have been sponsored by multiple Vaadin customers. Learn more about our support and pricing at [Vaadin Pricing](https://vaadin.com/pricing).