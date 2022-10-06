// Create a shadow container with all styles and a placeholder for the app injection
exports.createShadowInstance = function (parentElementId: string): HTMLDivElement {
  const { styles, instances } = window[__webpack_runtime_id__ + "styleContainer"];
  const shadowContainer = document.getElementById(parentElementId);
  if (shadowContainer === null) {
    throw new Error("Parent Id Not Found");
  }
  // Block all styles coming from the light DOM
  shadowContainer.style.all = "initial";
  shadowContainer.attachShadow({ mode: "open", delegatesFocus: true });
  if (!shadowContainer.shadowRoot) {
    throw new Error("shadowRoot was not created successfully for parent " + parentElementId);
  }
  shadowContainer.shadowRoot.append(...styles.map((style) => style.cloneNode(true)));
  // Create a body element so that reboot CSS rules work in the shadow DOM
  const body = document.createElement("body");
  // Create a placeholder for the React app
  const appPlaceholder = document.createElement("div");
  appPlaceholder.id = "app-placeholder";
  body.appendChild(appPlaceholder);
  shadowContainer.shadowRoot.appendChild(body);
  instances[parentElementId] = shadowContainer;
  return appPlaceholder;
};

exports.deleteShadowInstance = function (id: string) {
  const { instances } = window[__webpack_runtime_id__ + "styleContainer"];
  delete instances[id];
};

exports.insert = function (style: HTMLElement) {
  const sc = window[__webpack_runtime_id__ + "styleContainer"] || {};
  if (typeof sc.isStandalone === "undefined") {
    window[__webpack_runtime_id__ + "styleContainer"] = {
      styles: [],
      instances: {},
      isStandalone: false,
    };
  }
  const { styles, instances, isStandalone } = window[__webpack_runtime_id__ + "styleContainer"];
  // Update the style list for newly created shadow instances
  styles.push(style);

  if (isStandalone) {
    document.head.appendChild(style);
  } else {
    // Update the style list for already existing shadow instances.
    // This will provide them with any lazy loaded styles.
    Promise.resolve().then(() => {
      Object.values(instances).forEach((instance) => {
        instance.shadowRoot.appendChild(style.cloneNode(true));
      });
    });
  }
};

// If this function is called it will make the style loader behave as it normally does
// and insert the styles into the head of the document instead of the shadow DOM
exports.runStandalone = function () {
  let { styles } = window[__webpack_runtime_id__ + "styleContainer"];
  window[__webpack_runtime_id__ + "styleContainer"].isStandalone = true;
  styles.forEach((style) => document.head.appendChild(style));
};
