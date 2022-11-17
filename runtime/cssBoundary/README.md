# Microfrontend CSS Boundary

Block outside CSS from affecting your microfrontend application.

## Notes

This library allows you to completely isolate the CSS of your microfrontend application from the host application by dynamically placing it inside a Web Component (i.e. using the shadow DOM browser feature). The isolation enables you to use different versions of libraries with global CSS rules (such as Bootstrap) in parallel. It can be helpful if you need to split an old monolithic application into microfrontends or for testing purposes. Currently the library works only in conjuntion with [style-loader](https://www.npmjs.com/package/style-loader) (`mini-css-extract-plugin` is not yet supported).

## How to use

> **Warning**
>
> This library is intened for use inside an embedded microfrontend application. It is not intended to be used in the host (a.k.a. shell) application.

In order for the CSS imports to work properly inside the microfrontend application first you need to pass the `insert` function from the library to the `style-loader` options in the Webpack configuration:

```js
// webpack.config.js
const { insert } = require('css-boundary');

module.exports = {
  // ...
  module: {
    // ...
    rules: [
      // ...
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              insert,
            },
          },
          'css-loader',
        ],
      },
    ],
  },
};
```

**Then you have two options:**

### 1. If you use React the simplest way is to use the `CssBoundary` component at the root of your application:

```jsx
// App.jsx
import { CssBoundary } from 'css-boundary';

const App = () => (
  <CssBoundary>
    {/* Application code */}
  </CssBoundary>
);
```

> **Warning**
>
> Use React version 17 or higher in the microfrontend application. Lower versions of React do not re-render properly when inside a shadow DOM.

### 2. If you don't use React or you wish to have more fine control you can use the `createShadowInstance` and `deleteShadowInstance` functions:

```js
// SomeComponent.js
import { createShadowInstance, deleteShadowInstance } from 'css-boundary';

// After mount:
const parentElement = document.getElementById('some-element');
const appPlaceholder = createShadowInstance(parentElement); // Creates a shadow DOM and attaches it to the parentElement which is an HTMLElement

// appPlaceholder is where you can inject your application code. For example:
appPlaceholder.innerHTML = '<div>My application</div>';

// On unmount:
deleteShadowInstance(parentElement); // parentElement is the HTMLElement where the shadow DOM was attached
```

Both ways will render the microfronend application inside a shadow DOM attached to the app injection HTML element. Any global or local CSS used anywhere in the embedded application will be placed inside the shadowRoot and will not affect or be affected by the host application.
