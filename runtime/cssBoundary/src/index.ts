// Create a shadow container with all styles and a placeholder for the app injection
exports.createShadowInstance = function (parentElementId) {
  const { styles, instances } = window['css-boundary-' + __webpack_runtime_id__];
  const shadowContainer = document.getElementById(parentElementId);
  // Block all styles coming from the light DOM
  shadowContainer.style.all = 'initial';
  shadowContainer.attachShadow({ mode: 'open', delegatesFocus: true });
  shadowContainer.shadowRoot.append(...styles.map(style => style.cloneNode(true)));
  // Create a body element so that reboot CSS rules work in the shadow DOM
  const body = document.createElement('body');
  // Create a placeholder for the React app
  const appPlaceholder = document.createElement('div');
  appPlaceholder.id = 'app-placeholder';
  body.appendChild(appPlaceholder);
  shadowContainer.shadowRoot.appendChild(body);
  instances[parentElementId] = shadowContainer;
  return appPlaceholder;
};

exports.deleteShadowInstance = function (id) {
  const { instances } = window['css-boundary-' + __webpack_runtime_id__];
  delete instances[id];
};

exports.insert = function (style) {
  const sc = window['css-boundary-' + __webpack_runtime_id__] || {};
  if (typeof sc.isStandalone === 'undefined') {
    window['css-boundary-' + __webpack_runtime_id__] = {
      styles: [],
      instances: {},
      isStandalone: false,
    };
  }
  const { styles, instances, isStandalone } = window['css-boundary-' + __webpack_runtime_id__];
  // Update the style list for newly created shadow instances
  styles.push(style);

  if (isStandalone) {
    document.head.appendChild(style);
  } else {
    // Update the style list for already existing shadow instances.
    // This will provide them with any lazy loaded styles.
    Promise.resolve().then(() => {
      Object.values(instances).forEach(instance => {
        instance.shadowRoot.appendChild(style.cloneNode(true));
      });
    });
  }
};

// If this function is called it will make the style loader behave as it normally does
// and insert the styles into the head of the document instead of the shadow DOM
exports.runStandalone = function () {
  let { styles } = window['css-boundary-' + __webpack_runtime_id__];
  window['css-boundary-' + __webpack_runtime_id__].isStandalone = true;
  styles.forEach(style => document.head.appendChild(style));
};
