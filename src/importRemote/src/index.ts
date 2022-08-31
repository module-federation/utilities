/* eslint-disable no-undef */

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
      // Load the remote:
      await loadRemote(`${url}/${remoteEntryFileName}`, scope, bustRemoteEntryCache);
      if (!window[scope]) {
        throw new Error(
          `Remote loaded successfully but ${scope} could not be found! Verify that the name is correct in the Webpack configuration!`,
        );
      }
      // Initializes the share scope. This fills it with known provided modules from this build and all remotes
      if(!__webpack_share_scopes__?.default) {
          await __webpack_init_sharing__("default")
      }
      try {
          // Initialize the container, it may provide shared modules:
          if(!window[scope].__initialized) await window[scope].init(__webpack_share_scopes__.default)
          window[scope].__initialized = true;
      } catch (error) {
          // If the container throws an error, it is probably because it is not a container.
          // In that case, we can just ignore it.
      }
    } catch (error) {
      // Rethrow the error in case the user wants to handle it:
      throw error;
    }
  }
  /*
  //TODO this all needs the try catch stuff for safety like you did above
// parallel bootup
  await Promise.all([
      ()=>loadRemote(`${url}/${remoteEntryFileName}`, scope, bustRemoteEntryCache),
      ()=> await __webpack_init_sharing__("default"),
  ]);
  // negotiate shared modules and start getting the exposed module, but dont execute factory
  const [,moduleFactory] = await Promise.all([
      window[scope].init(__webpack_share_scopes__.default),
      window[scope].get(module.startsWith("./") ? module : `./${module}`)
  ])
*/

  const moduleFactory = await window[scope].get(module.startsWith("./") ? module : `./${module}`);
  return moduleFactory();
};
