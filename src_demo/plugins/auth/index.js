import axios from 'axios';
import qs from 'qs';
import AuthModal from './AuthModal.vue';

export default {
  /**
   * The basic auth plugin exposes the following options
   * - apiBaseUrl
   *
   * @param {object} Vue
   * @param {object} options
   */
  install: (Vue, options) => {
    const getStorageItem = (key) => {
      let result;
      try {
        result = JSON.parse(localStorage.getItem(`${Vue.prototype.$basicAuth.localStoragePrefix}${key}`));
      } catch (e) {
        return localStorage.getItem(`${Vue.prototype.$basicAuth.localStoragePrefix}${key}`);
      }
      return result;
    };

    const isUserAuthenticated = () => getStorageItem('authenticationMode') === 'AUTH_MODE_REGISTERED';

    const getTokenExpirationTimestamp = (expiresIn) => {
      const currentDate = new Date();
      currentDate.setSeconds(currentDate.getSeconds() + expiresIn + 300);
      return currentDate.getTime();
    };

    if (!options) {
      throw Error('The plugin needs an options object with at least apiBaseUrl.');
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!options.hasOwnProperty('apiBaseUrl')) {
      throw Error('The auth plugin options must define apiBaseUrl.');
    }

    // register Vue component
    Vue.component('dcp-authentication', AuthModal);

    Vue.prototype.$basicAuth = {
      // other components can register callbacks that are triggered, once an
      // authentication event for the registered authentication target has happened
      authenticationCallbacks: {
        login: [],
        logout: []
      },

      // the local storage keys which are set
      applicationStorage: {
        userAccessTokenKey: 'userAccessToken',
        userIdKey: 'userId'
      },

      // the authenticationRequestCallback is registered out of the authentication
      // component and is used to tell the component to start the authenticatition
      authenticationRequestCallback: undefined,

      authenticationToken:
        localStorage.getItem(`${options.localStoragePrefix ? `${options.localStoragePrefix}-` : ''}userAccessToken`) || undefined,

      baseUrl: options.apiBaseUrl,

      localStoragePrefix: options.localStoragePrefix ? `${options.localStoragePrefix}-` : '',

      registerAuthenticationRequestCallback: (callback) => {
        if (Vue.prototype.$basicAuth.authenticationRequestCallback !== undefined) {
          throw Error('You cannot have more than one dcp authentication component in your application.');
        }
        Vue.prototype.$basicAuth.authenticationRequestCallback = callback;
      },

      /**
       * Clean the application storage and remove the userId, the accessToken and the
       * authenticationToken.
       */
      cleanStorage() {
        const prefix = Vue.prototype.$basicAuth.localStoragePrefix;

        localStorage.removeItem(`${prefix}${Vue.prototype.$basicAuth.applicationStorage.userIdKey}`);
        localStorage.removeItem(`${prefix}${Vue.prototype.$basicAuth.applicationStorage.userAccessTokenKey}`);
        localStorage.removeItem(`${prefix}cartId`);
        localStorage.removeItem(`${prefix}cartGuid`);

        Vue.prototype.$basicAuth.authenticationToken = undefined;
      },

      /**
       * Triggers registered callbacks for authentication hook targets.
       *
       * @param {array} targets
       * @param {object} payload
       */
      triggerRegisteredExternalCallbacks: (targets, payload) => {
        targets.forEach((target) => {
          const targetCallbacks = Vue.prototype.$basicAuth.authenticationCallbacks[target] || [];
          targetCallbacks.forEach((registeredCallback) => {
            registeredCallback(payload);
          });
        });
      },

      async loadTokenForAnonymousUser() {
        try {
          const prefix = Vue.prototype.$basicAuth.localStoragePrefix;
          const { baseUrl, applicationStorage } = Vue.prototype.$basicAuth;

          const { data } = await axios
            .post(`${baseUrl}/oauth/token`, qs.stringify({
              username: 'anonymous',
              client_id: 'ui_client',
              client_secret: 'secret',
              grant_type: 'client_credentials'
            }));

          const accessToken = data.access_token;
          Vue.prototype.$basicAuth.authenticationToken = accessToken;

          localStorage.setItem(
            `${prefix}${applicationStorage.userAccessTokenKey}`,
            accessToken
          );
          localStorage.setItem(`${prefix}authenticationMode`, 'AUTH_MODE_ANONYMOUS');
          localStorage.setItem(
            `${prefix}anonymousAccessTokenValidity`,
            getTokenExpirationTimestamp(data.expires_in)
          );

          return accessToken;
        } catch (error) {
          throw Error(`Could not retrieve auth token: ${error}`);
        }
      }
    };

    /**
     * Removes a previously added callback for an authentication event.
     *
     * @param {string} target
     * @param {function} callback
     */
    Vue.prototype.$deregisterAuthenticationCallback = (targetOrTargets, callback) => {
      // if its not an array enlist it
      const targets = Array.isArray(targetOrTargets) ? targetOrTargets : [targetOrTargets];
      targets.forEach((target) => {
        if (Vue.prototype.$basicAuth.authenticationCallbacks[target]) {
          const index = Vue.prototype.$basicAuth.authenticationCallbacks[target].indexOf(callback);
          if (index > -1) {
            Vue.prototype.$basicAuth.authenticationCallbacks[target].splice(index, 1);
          }
        }
      });
    };

    /**
     * Returns the user authentication token in case the user is already
     * authenticated.
     *
     * @returns {Promise} the user token Promise
     */
    Vue.prototype.$getAuthenticationToken = () => Promise.resolve(
      Vue.prototype.$basicAuth.authenticationToken
    );

    /**
     * Only the following methods are officially exposed on all components
     * that are part of a Vue instance that used the CIAM plugin.
     */
    Vue.prototype.$isAuthenticated = isUserAuthenticated;

    /**
     * Add a callback for the given authentication targets. A target can be e.g.
     * logout or login. So every component that is interested in getting informed
     * about the user logging in, will register a callback for the target 'login'.
     *
     * @param {string} target
     * @param {function} callback
     */
    Vue.prototype.$registerAuthenticationCallback = (targetOrTargets, callback) => {
      // if its not an array enlist it
      const targets = Array.isArray(targetOrTargets) ? targetOrTargets : [targetOrTargets];

      targets.forEach((target) => {
        if (!Vue.prototype.$basicAuth.authenticationCallbacks[target]) {
          Vue.prototype.$basicAuth.authenticationCallbacks[target] = [];
        }
        Vue.prototype.$basicAuth.authenticationCallbacks[target].push(callback);
      });
    };

    /**
     * Reset all user based data so that the application knows the user is not logged in anymore.
     */
    Vue.prototype.$resetAuthData = () => {
      Vue.prototype.$basicAuth.cleanStorage();
    };

    /**
     * Tells the plugin to start the authentication process.
     *
     * @param {string} target specifies which authentication process to start
     */
    Vue.prototype.$triggerAuthentication = (target) => {
      // it could happen that the AuthModal component has not yet been mounted,
      // so we have to wait for it to be available
      const timerId = setInterval(() => {
        if (Vue.prototype.$basicAuth.authenticationRequestCallback) {
          Vue.prototype.$basicAuth.authenticationRequestCallback(target);
          clearInterval(timerId);
        }
      }, 100);
    };
  }
};
