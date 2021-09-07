<div align="center">
  <h1>MJML Testing Library</h1>
  <p>Simple MJML DOM testing utilities that encourage good testing practices.</p>
</div>

<hr />

## Table of Contents

- [Installation](#installation)
- [Examples](#examples)
  - [Basic Example](#basic-example)
  - [Using MJML configuration](#using-mjml-configuration)
  - [Inspecting JSON structures](#inspecting-json-structures)
- [Issues](#issues)
  - [🐛 Bugs](#-bugs)
  - [💡 Feature Requests](#-feature-requests)
- [LICENSE](#license)

## Installation

This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev mjml-testing-library
```

Or for installation via [yarn][yarn]:

```
yarn add --dev mjml-testing-library
```

This library has a `peerDependencies` listing for `mjml`.

You may also be interested in installing `@testing-library/jest-dom` so you can use [the custom jest matchers](https://github.com/testing-library/jest-dom).

## Examples

### Basic Example

At its basic level this library compiles MJML down to HTML and then configures it to work with [DOM Testing Library](https://testing-library.com/docs/dom-testing-library/intro/).

```jsx
// this import is something you'd normally configure
// Jest to import for you automatically
import '@testing-library/jest-dom';

import { render, screen } from 'mjml-testing-library';

const testMessage = 'Hello, World!';
const template = `
  <mjml>
    <mj-body>
      <mj-section>
        <mj-column>
          <mj-text color="blue" font-size="10px">
            ${testMessage}
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`;

test('displays the welcome text', () => {
  // Render the MJML and insert it into the global document
  render(template);

  // Check the rendered HTML to ensure our expected text is in place
  // .toBeInTheDocument() is an assertion that comes from jest-dom
  // otherwise you could use .toBeDefined()
  expect(screen.getByText(testMessage)).toBeInTheDocument();
});
```

### Using MJML configuration

You can also supply an MJML configuration object to the render function. One example of this being useful is ensuring your MJML is valid:

```jsx
import { render } from 'mjml-testing-library';

const template = `
  <mjml>
    <mj-section>
      <mj-body>
        <mj-text color="blue" font-size="10px">
          ${testMessage}
        </mj-text>
      </mj-body>
    </mj-section>
  </mjml>
`;

test('the template is valid', () => {
  expect(() => {
    // Render the MJML with MJML validation set to strict
    render(template, {
      mjmlOptions: { validationLevel: 'strict' },
    });
  })
    // This will fail because the provided template is invalid MJML
    .not.toThrow();
});
```

### Inspecting JSON structures

This library also allows you to inspect the parsed MJML as JSON, which is useful if you'd rather assert on specific object values:

```jsx
import { render } from 'mjml-testing-library';

const template = `
  <mjml>
    <mj-body>
      <mj-text color="blue">
        Hello, World!
      </mj-text>
      <mj-text color="red">
        Hello, World!
      </mj-text>
      <mj-text color="green">
        Hello, World!
      </mj-text>
    </mj-body>
  </mjml>
`;

test('correctly renders the children', () => {
  // Render the MJML and grab the JSON representation
  const { json } = render(template);

  const body = json.children[0];
  expect(body.tagName).toEqual('mj-body');
  expect(body.children).toHaveLength(3);
});
```

## Issues

Looking to contribute? Look for the [Good First Issue][good-first-issue] label.

### 🐛 Bugs

Please file an issue for bugs, missing documentation, or unexpected behavior.

[**See Bugs**][bugs]

### 💡 Feature Requests

Please file an issue to suggest new features. Vote on feature requests by adding a 👍. This helps maintainers prioritize what to work on.

[**See Feature Requests**][requests]

## LICENSE

[MIT](LICENSE)

[npm]: https://www.npmjs.com/
[yarn]: https://classic.yarnpkg.com
[node]: https://nodejs.org
[bugs]: https://github.com/jodyheavener/mjml-testing-library/issues?q=is%3Aissue+is%3Aopen+label%3Abug+sort%3Acreated-desc
[requests]: https://github.com/jodyheavener/mjml-testing-library/issues?q=is%3Aissue+sort%3Areactions-%2B1-desc+label%3Aenhancement+is%3Aopen
[good-first-issue]: https://github.com/jodyheavener/mjml-testing-library/issues?utf8=✓&q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3A"good+first+issue"+
