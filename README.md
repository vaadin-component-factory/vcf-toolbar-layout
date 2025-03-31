# &lt;vcf-toolbar-layout&gt;

[![npm version](https://badgen.net/npm/v/@vaadin-component-factory/vcf-toolbar-layout)](https://www.npmjs.com/package/@vaadin-component-factory/vcf-toolbar-layout)

This is the LitElement based version of `<vcf-toolbar-layout>` Web Component.

## Features

### Reverse collapse
Items collapse from the left side.

#### HTML
```html
<vcf-toolbar-layout reverse-collapse>
    <button>Button 1</button>
    <button>Button 2</button>
</vcf-toolbar-layout>
```

#### Javascript
```javascript
document.querySelector('vcf-toolbar-layout').reverseCollapse = true;
```

### Overflow update debounce delay
Specify the delay after a resize before the toolbar updates its overflow state.

#### HTML
```html
<vcf-toolbar-layout update-debounce-delay="20">
    <button>Button 1</button>
    <button>Button 2</button>
</vcf-toolbar-layout>
```

#### Javascript
```javascript
document.querySelector('vcf-toolbar-layout').updateDebounceDelay = 20;
```

## Running demo

1. Fork the `vcf-toolbar-layout` repository and clone it locally.

1. Make sure you have [npm](https://www.npmjs.com/) installed.

1. When in the `vcf-toolbar-layout` directory, run `npm install` to install dependencies.

1. Run `npm start` to open the demo.