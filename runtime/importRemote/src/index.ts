export interface ImportRemoteOptions {
  url: string;
  scope: string;
  module: string;
  remoteEntryFileName?: string;
  bustRemoteEntryCache?: boolean;
}

const REMOTE_ENTRY_FILE = "remoteEntry.js";

const loadRemote = (
  url: ImportRemoteOptions["url"],
  scope: ImportRemoteOptions["scope"],
  bustRemoteEntryCache: ImportRemoteOptions["bustRemoteEntryCache"],
) =>
  new Promise<void>((resolve, reject) => {
    const timestamp = bustRemoteEntryCache ? `?t=${new Date().getTime()}` : "";
    __webpack_require__.l(
      `${url}${timestamp}`,
      (event) => {
        if (event?.type === "load") {
          // Script loaded successfully:
          return resolve();
        }
        const realSrc = event?.target?.src;
        const error = new Error();
        error.message = "Loading script failed.\n(missing: " + realSrc + ")";
        error.name = "ScriptExternalLoadError";
        reject(error);
      },
      scope,
    );
  });

const initSharing = async () => {
  if (!__webpack_share_scopes__?.default) {
    await __webpack_init_sharing__("default");
  }
};

const initContainer = async (containerScope) => {
  try {
    if (!containerScope.__initialized) {
      await containerScope.init(__webpack_share_scopes__.default);
      containerScope.__initialized = true;
    }
  } catch (error) {
    // If the container throws an error, it is probably because it is not a container.
    // In that case, we can just ignore it.
  }
};

/*
  Dynamically import a remote module using Webpack's loading mechanism:
  https://webpack.js.org/concepts/module-federation/
*/
export const importRemote = async <T>({
  url,
  scope,
  module,
  remoteEntryFileName = REMOTE_ENTRY_FILE,
  bustRemoteEntryCache = true,
}: ImportRemoteOptions): Promise<T> => {
  if (!window[scope]) {
    try {
      // Load the remote and initialize the share scope if it's empty
      await Promise.all([loadRemote(`${url}/${remoteEntryFileName}`, scope, bustRemoteEntryCache), initSharing()]);
      if (!window[scope]) {
        throw new Error(
          `Remote loaded successfully but ${scope} could not be found! Verify that the name is correct in the Webpack configuration!`,
        );
      }
      // Initialize the container to get shared modules and get the module factory:
      const [, moduleFactory] = await Promise.all([
        initContainer(window[scope]),
        window[scope].get(module.startsWith("./") ? module : `./${module}`),
      ]);
      return moduleFactory();
    } catch (error) {
      // Rethrow the error in case the user wants to handle it
      throw error;
    }
  } else {
    const moduleFactory = await window[scope].get(module.startsWith("./") ? module : `./${module}`);
    return moduleFactory();
  }
};
