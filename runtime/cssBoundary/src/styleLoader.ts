// Create a shadow container with all styles and a placeholder for the app injection
export const createShadowInstance = function (parentElementId: string) {
  const { styles, instances }: { styles: HTMLElement[]; instances: { [key: string]: HTMLElement } } =
    window["css-boundary-" + __webpack_runtime_id__];
  const shadowContainer = document.getElementById(parentElementId);
  if (!shadowContainer) {
    throw new Error(`Could not find element with id ${parentElementId}`);
  }
  // Block all styles coming from the light DOM
  shadowContainer.style.all = "initial";
  try {
    shadowContainer.attachShadow({ mode: "open", delegatesFocus: true });
    if (!shadowContainer.shadowRoot) {
      throw new Error("Shadow root not available");
    }
  } catch (error) {
    throw error;
  }
  shadowContainer.shadowRoot.append(...styles.map((style) => style.cloneNode(true)));
  instances[parentElementId] = shadowContainer;
  return shadowContainer.shadowRoot;
};

export const deleteShadowInstance = function (id: string) {
  const { instances } = window["css-boundary-" + __webpack_runtime_id__];
  delete instances[id];
};

export const insert = function (style: HTMLElement) {
  const sc = window["css-boundary-" + __webpack_runtime_id__] || {};
  if (typeof sc.isStandalone === "undefined") {
    window["css-boundary-" + __webpack_runtime_id__] = {
      styles: [],
      instances: {},
      isStandalone: false,
    };
  }
  const {
    styles,
    instances,
    isStandalone,
  }: { styles: HTMLElement[]; instances: { [key: string]: HTMLElement }; isStandalone: boolean } =
    window["css-boundary-" + __webpack_runtime_id__];
  // Update the style list for newly created shadow instances
  styles.push(style);

  if (isStandalone) {
    document.head.appendChild(style);
  } else {
    // Update the style list for already existing shadow instances.
    // This will provide them with any lazy loaded styles.
    Promise.resolve().then(() => {
      Object.values(instances).forEach((instance) => {
        if (instance.shadowRoot) {
          instance.shadowRoot.appendChild(style.cloneNode(true));
        }
      });
    });
  }
};

// If this function is called it will make the style loader behave as it normally does
// and insert the styles into the head of the document instead of the shadow DOM
export const runStandalone = function () {
  let { styles }: { styles: HTMLElement[] } = window["css-boundary-" + __webpack_runtime_id__];
  window["css-boundary-" + __webpack_runtime_id__].isStandalone = true;
  styles.forEach((style) => document.head.appendChild(style));
};
