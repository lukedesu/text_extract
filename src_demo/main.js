import { setConfiguration, getConfiguration } from '@dcp-vue/platform-core/src/utils/configuration';

// it is important to set the base url before anything else is being processed
import './utils/setBaseUrl';

// now the base url can be used in all other modules
import Vue from 'vue';
import VueI18n from 'vue-i18n';

// the shop configuration plugin takes care for initializing the Vie shop instance
// with all required plugins
import shopConfigurationPlugin, { AvailableFeatures } from '@dcp-vue/platform-core/src/plugins/shopConfiguration';

import CiamAuth from '@dcp-vue/platform-core/src/plugins/ciam';
import { generatePrefix } from '@dcp-vue/platform-core/src/utils/persistence';
import AuthPlugin from './plugins/auth';
// all shop specific artifacts must be imported to initialize the shop instance with
import fsmStates from './utils/fsmStates.json';
import { finiteStateMachineConfig } from './utils/fsm';
import { initializeRouter } from './utils/router';
import { makeStore } from './utils/store';
import sfCheckbox from './components/_globals/sfCheckbox.vue';
import messages from './config/locales.json';

Vue.config.productionTip = false;

Vue.use(shopConfigurationPlugin, {
  features: [
    // AvailableFeatures.DealerLocator,
    // [OTOS-1299]: Remove CIAM dependency
    // AvailableFeatures.CiamAuthentication,
    AvailableFeatures.FiniteStateMachine,
    AvailableFeatures.FinCalc,
    AvailableFeatures.Footnotes,
    AvailableFeatures.HybrisConfiguration,
    AvailableFeatures.Tracking,
    // AvailableFeatures.UserlikeChat
  ]
});

// you can overwrite the baseUrl that will affect how backend requests are
// made. For most users this should be done in the Kubernetes deployment
// configuration, so you most likely won't need this option.
//
// window.dcp.baseUrl = '/your-new-base-url';

const configurationEndpoint = `${window.dcp.baseUrl}config`;

Vue.prototype.$loadShopConfiguration(configurationEndpoint)
  .then(({
    overseasConfig, locale, lang, defaultCurrency, defaultCurrencySymbol, shopBaseUrl, apiBaseUrl, shopCountry
  }) => {
    // you can overwrite your locale or language in case the default mechanism
    // of platform-core does not fit your needs
    //
    // Vue.config.appConfig.locale = 'en-US';
    // Vue.config.appConfig.lang = 'en';

    Vue.use(VueI18n);

    // [OTOS-1299]: Don't use CIAM authentication if login is disabled
    const { isAnonymous } = overseasConfig;
    const AuthenticationPlugin = isAnonymous ? AuthPlugin : CiamAuth;
    const ciamConfig = {
      shopBaseUrl,
      cookieDomain: getConfiguration('ciamCookieDomain') || undefined,
      ciamMode: getConfiguration('ciamMode'),
      ciamPath: '/v2/auth/ciam/redirect',
      country: getConfiguration('shopCountry'),
      localStoragePrefix: generatePrefix(),
      siteId: getConfiguration('siteId')
    };
    const authConfig = {
      apiBaseUrl,
      ...(
        isAnonymous
          ? {}
          : ciamConfig
      )
    };

    Vue.use(AuthenticationPlugin, authConfig);

    // all core plugins are added in the $initializeShopInstance function but
    // additional plugins can be added here:
    //
    // Vue.use(YourShopInstanceSpecificPlugin);

    // the options object required by Vue. If there is no custom render function
    // given the default render function from the core will be taken.
    // @see https://vuejs.org/v2/guide/instance.html
    const vueInstanceOptions = {
      store: makeStore({
        state: {
          ...overseasConfig,
          shopCountry
        }
      }),
      i18n: new VueI18n({
        locale,
        fallbackLocale: lang,
        messages,
        numberFormats: {
          [locale]: {
            currency: {
              style: 'currency',
              currency: defaultCurrency || 'GBP'
            }
          }
        }
      }),
      router: initializeRouter({
        shopBaseUrl,
        overseasConfig
      })
    };

    const fsmConfiguration = {
      fsm: finiteStateMachineConfig,
      states: fsmStates
    };

    const toAthorizeAnonymousUser = isAnonymous
      ? Vue.prototype.$basicAuth.loadTokenForAnonymousUser()
      : Promise.resolve();
    toAthorizeAnonymousUser
      .then(() => {
        Vue.prototype.$initializeShopInstance(vueInstanceOptions, fsmConfiguration);
      });

    // mp specific global components
    Vue.component('sf-checkbox', sfCheckbox);

    setConfiguration('defaultCurrencySymbol', defaultCurrencySymbol);
  })
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Could not initialize Vue application', error);
  });
