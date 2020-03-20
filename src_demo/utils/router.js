import Vue from 'vue';
import VueRouter from 'vue-router';
import VueMeta from 'vue-meta';
import isEqual from 'lodash/merge';
import get from 'lodash/get';
import states from './fsmStates.json';

Vue.use(VueRouter);
Vue.use(VueMeta);

const routerConfig = {
  // when activating the history mode, the server must be configured to support it:
  // https://router.vuejs.org/guide/essentials/history-mode.html#example-server-configurations
  //
  mode: 'history',
  // the base setting can be overwritten by the environment specific configuration in the
  // shop instance's deployment repository (see shopBaseUrl configuration parameter)
  base: process.env.BASE_URL || '/',
  scrollBehavior(to, from) {
    // no scrolling transition between product configuration sections
    if (
      from && from.name.indexOf(states.configuration.name) > -1 &&
      to && to.name.indexOf(states.configuration.name) > -1
    ) {
      return {};
    }
    // no scrolling when transiting to the same route with the same params
    if (from && to.name === from.name && isEqual(to.params, from.params)) {
      return {};
    }

    return window.scrollTo ? window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }) : { x: 0, y: 0 };
  },
  routes: [
    {
      path: '/error',
      component: () => import(/* webpackChunkName: "chunk-error-page" */ '@dcp-vue/platform-core/src/components/views/error/index.vue'),
      name: states.error.name,
      label: 'Error',
      showInMenu: false,
      meta: {
        cta: false,
        metaInformation: {
          en: {
            title: 'Error Page'
          }
        },
        requiresAuth: false,
        showProgressBar: false,
        showStage: false,
        showStageImage: false,
        tracking: {
          name: 'dcp:marketplace:error page',
          type: 'error pages'
        }
      }
    },
    {
      path: '/',
      component: () => import(/* webpackChunkName: "chunk-home" */ '@dcp-vue/platform-core/src/components/views/home/index.vue'),
      name: states.home.name,
      label: 'Home',
      showInMenu: false,
      meta: {
        metaInformation: {
          en: {
            title: 'Home'
          }
        },
        tracking: {
          name: '',
          type: ''
        }
      },
      redirect: { name: states.srp.name }
    },
    {
      path: '/srp',
      component: () => import(/* webpackChunkName: "chunk-srp" */ '@dcp-vue/platform-core/src/components/views/srp/index.vue'),
      name: states.srp.name,
      label: 'Search Overview',
      showInMenu: true,
      meta: {
        cta: false,
        metaInformation: {
          en: {
            title: 'Search Overview'
          }
        },
        requiresAuth: false,
        showProgressBar: false,
        showStage: true,
        showStageImage: false,
        tracking: {
          name: 'dcp:marketplace:product list',
          type: 'product list pages'
        }
      }
    },
    {
      path: '/pdp/:code',
      component: () => import(/* webpackChunkName: "chunk-pdp" */ '@dcp-vue/platform-core/src/components/views/pdp/index.vue'),
      name: states.pdp.name,
      label: 'Product Detail Page',
      showInMenu: false,
      meta: {
        cta: false,
        metaInformation: {
          en: {
            title: 'Product Detail Page'
          }
        },
        requiresAuth: false,
        showProgressBar: false,
        showStage: false,
        showStageImage: false,
        tracking: {
          name: 'dcp:marketplace:product detail page',
          type: 'product detail pages'
        }
      }
    },
    {
      path: '/configuration',
      component: () => import(/* webpackChunkName: "chunk-configuration" */ '@dcp-vue/platform-core/src/components/views/configuration/index.vue'),
      name: states.configuration.name,
      label: 'Product Configuration',
      showInMenu: false,
      meta: {
        cta: false,
        footerBackLink: states.pdp.name,
        metaInformation: {
          en: {
            title: 'Product Configuration'
          }
        },
        requiresAuth: false,
        showProgressBar: true,
        showStage: false,
        showStageImage: false,
        tracking: {
          name: '',
          type: ''
        }
      },
      redirect: { name: `${states.configuration.name}/${states.recommendations.name}` },
      children: [
        {
          path: 'recommendations',
          component: () => import(/* webpackChunkName: "chunk-recommendations" */ '@dcp-vue/platform-core/src/components/views/recommendations/index.vue'),
          name: `${states.configuration.name}/${states.recommendations.name}`,
          label: 'Recommendations',
          showInMenu: true,
          meta: {
            cta: false,
            metaInformation: {
              en: {
                title: 'Recommendations'
              }
            },
            requiresAuth: false,
            showProgressBar: true,
            showStage: true,
            showStageImage: true,
            tracking: {
              name: 'recommendations',
              type: 'configuration pages',
              goToLinkName: 'go to recommendations'
            }
          }
        },
        {
          path: 'trade-in',
          component: () => import(/* webpackChunkName: "chunk-trade-in-yn" */ '@dcp-vue/platform-core/src/components/tradeIn/tradeInYN/index.vue'),
          name: `${states.configuration.name}/${states.tradeInYN.name}`,
          label: 'Trade-In',
          showInMenu: true,
          meta: {
            cta: false,
            metaInformation: {
              en: {
                title: 'Trade-In'
              }
            },
            requiresAuth: false,
            showProgressBar: true,
            showStage: false,
            showStageImage: false,
            tracking: {
              name: '',
              type: ''
            }
          }
        },
        {
          path: 'fin',
          component: () => import(/* webpackChunkName: "chunk-vin-yn" */ '@dcp-vue/platform-core/src/components/tradeIn/vinYN/index.vue'),
          name: `${states.configuration.name}/${states.vinYN.name}`,
          label: 'VIN Entry',
          showInMenu: true,
          meta: {
            cta: false,
            metaInformation: {
              en: {
                title: 'VIN Entry'
              }
            },
            requiresAuth: false,
            showProgressBar: true,
            showStage: true,
            showStageImage: true,
            tracking: {
              name: '',
              type: ''
            }
          }
        },
        {
          path: 'vehicle-funnel',
          component: () => import(/* webpackChunkName: "chunk-vehicle-funnel-yn" */ '@dcp-vue/platform-core/src/components/tradeIn/vehicleFunnel/index.vue'),
          name: `${states.configuration.name}/${states.vehicleFunnel.name}`,
          label: 'Vehicle Funnel',
          showInMenu: true,
          meta: {
            cta: false,
            metaInformation: {
              en: {
                title: 'Vehicle Funnel'
              }
            },
            requiresAuth: false,
            showProgressBar: true,
            showStage: true,
            showStageImage: true,
            tracking: {
              name: '',
              type: ''
            }
          }
        },
        {
          path: 'fin-input',
          component: () => import(/* webpackChunkName: "chunk-vin-input" */ '@dcp-vue/platform-core/src/components/tradeIn/vinInput/index.vue'),
          name: `${states.configuration.name}/${states.vinInput.name}`,
          label: 'VIN Input',
          showInMenu: true,
          meta: {
            cta: false,
            metaInformation: {
              en: {
                title: 'VIN Input'
              }
            },
            requiresAuth: false,
            showProgressBar: true,
            showStage: true,
            showStageImage: true,
            tracking: {
              name: '',
              type: ''
            }
          }
        },
        {
          path: 'vehicle-results',
          component: () => import(/* webpackChunkName: "chunk-trade-in-vehicle-results" */ '@dcp-vue/platform-core/src/components/tradeIn/tradeInVehicleResults/index.vue'),
          name: `${states.configuration.name}/${states.tradeInVehicleResults.name}`,
          label: 'Vehicle Results',
          showInMenu: true,
          meta: {
            cta: false,
            metaInformation: {
              en: {
                title: 'Vehicle Results'
              }
            },
            requiresAuth: false,
            showProgressBar: true,
            showStage: true,
            showStageImage: true,
            tracking: {
              name: '',
              type: ''
            }
          }
        },
        {
          path: 'vehicle-details',
          component: () => import(/* webpackChunkName: "chunk-trade-in-vehicle-details" */ '@dcp-vue/platform-core/src/components/tradeIn/tradeInVehicleDetails/index.vue'),
          name: `${states.configuration.name}/${states.tradeInVehicleDetails.name}`,
          label: 'Vehicle Details',
          showInMenu: true,
          meta: {
            cta: false,
            metaInformation: {
              en: {
                title: 'Vehicle Details'
              }
            },
            requiresAuth: false,
            showProgressBar: true,
            showStage: true,
            showStageImage: true,
            tracking: {
              name: '',
              type: ''
            }
          }
        },
        {
          path: 'quote',
          component: () => import(/* webpackChunkName: "chunk-trade-in-quote" */ '@dcp-vue/platform-core/src/components/tradeIn/tradeInQuote/index.vue'),
          name: `${states.configuration.name}/${states.tradeInQuote.name}`,
          label: 'Trade-In Quote',
          showInMenu: true,
          meta: {
            cta: false,
            metaInformation: {
              en: {
                title: 'Trade-In Quote'
              }
            },
            requiresAuth: false,
            showProgressBar: true,
            showStage: true,
            showStageImage: true,
            tracking: {
              name: '',
              type: ''
            }
          }
        },
        {
          path: 'downstream-payment',
          component: () => import(/* webpackChunkName: "chunk-downstream-payment" */ '@dcp-vue/platform-core/src/components/downstreamPayment/downstreamPaymentOption/index.vue'),
          name: `${states.configuration.name}/${states.downstreamPaymentOption.name}`,
          label: 'Downstream Payment',
          showInMenu: true,
          meta: {
            cta: false,
            metaInformation: {
              en: {
                title: 'Downstream Payment'
              }
            },
            requiresAuth: false,
            showProgressBar: true,
            showStage: true,
            showStageImage: true,
            tracking: {
              name: '',
              type: ''
            }
          }
        },
        {
          path: 'finance-calculator',
          component: () => import(/* webpackChunkName: "chunk-finance-calculator" */ '@dcp-vue/platform-core/src/components/downstreamPayment/downstreamPaymentCalculation/index.vue'),
          name: `${states.configuration.name}/${states.downstreamPaymentCalculation.name}`,
          label: 'Finance Calculator',
          showInMenu: true,
          meta: {
            cta: false,
            metaInformation: {
              en: {
                title: 'Finance Calculator'
              }
            },
            requiresAuth: false,
            showProgressBar: true,
            showStage: true,
            showStageImage: true,
            tracking: {
              name: '',
              type: ''
            }
          },
        }
      ]
    },
    {
      path: '/cart',
      component: () => import(/* webpackChunkName: "chunk-cart" */ '@dcp-vue/platform-core/src/components/views/cart/index.vue'),
      name: states.cart.name,
      label: 'Cart',
      showInMenu: true,
      meta: {
        cta: false,
        metaInformation: {
          en: {
            title: 'Cart'
          }
        },
        requiresAuth: false,
        showProgressBar: true,
        showStage: true,
        showStageImage: true,
        tracking: {
          name: 'cart overview',
          type: 'checkout pages',
          goToLinkName: 'go to cart overview'
        }
      }
    },
    {
      path: '/login',
      component: () => import(/* webpackChunkName: "chunk-tunnel-page" */ '@dcp-vue/platform-core/src/components/views/tunnelPage/index.vue'),
      name: states.loginRegister.name,
      label: 'Login',
      showInMenu: true,
      meta: {
        cta: false,
        metaInformation: {
          en: {
            title: 'Login'
          }
        },
        requiresAuth: false,
        showProgressBar: true,
        showStage: true,
        showStageImage: true,
        footerBackLink: states.cart.name,
        tracking: {
          name: 'tunnel',
          type: 'checkout pages',
          goToLinkName: 'go to tunnel'
        }
      },
    },
    {
      path: '/payment-invoice',
      component: () => import(/* webpackChunkName: "chunk-payment-and-invoice" */ '@dcp-vue/platform-core/src/components/views/paymentAndInvoice/generic/index.vue'),
      name: states.payment.name,
      label: 'Payment and Invoice',
      showInMenu: true,
      meta: {
        cta: false,
        footerBackLink: states.cart.name,
        metaInformation: {
          en: {
            title: 'Address & Payment'
          }
        },
        requiresAuth: true,
        showProgressBar: true,
        showStage: true,
        showStageImage: true,
        tracking: {
          name: 'invoice and payment',
          type: 'checkout pages',
          goToLinkName: 'go to invoice and payment'
        }
      }
    },
    {
      path: '/order-overview',
      component: () => import(/* webpackChunkName: "chunk-cart-overview" */ '@dcp-vue/platform-core/src/components/views/cartOverview/index.vue'),
      name: states.cartOverview.name,
      label: 'Cart Overview',
      showInMenu: true,
      meta: {
        requiresAuth: true,
        cta: false,
        showProgressBar: true,
        showStage: true,
        showStageImage: true,
        footerBackLink: states.cart.name,
        metaInformation: {
          en: {
            title: 'Order Overview'
          }
        },
        tracking: {
          name: 'order overview',
          type: 'checkout pages',
          goToLinkName: 'go to order overview'
        }
      }
    },
    {
      path: '/confirmation',
      component: () => import(/* webpackChunkName: "chunk-confirmation" */ '@dcp-vue/platform-core/src/components/views/confirmation/index.vue'),
      name: states.confirmation.name,
      label: 'Order Confirmation',
      showInMenu: true,
      meta: {
        cta: false,
        metaInformation: {
          en: {
            title: 'Order Confirmation'
          }
        },
        requiresAuth: true,
        showProgressBar: true,
        showStage: true,
        showStageImage: true,
        tracking: {
          name: 'order confirmation',
          type: 'configuration pages'
        }
      }
    },
    // the fallback if no route can be matched (aka 404)
    {
      path: '*',
      redirect: { name: states.error.name, query: { errorCode: 'NOT_FOUND' } }
    }
  ]
};

export function initializeRouter({ shopBaseUrl, overseasConfig }) {
  if (shopBaseUrl) {
    routerConfig.base = shopBaseUrl;
  }

  const { isAnonymous, disableDirectCheckout } = overseasConfig;

  if (isAnonymous) {
    routerConfig.routes = routerConfig.routes
      .filter(({ path }) => path !== '/login');
  }

  if (disableDirectCheckout) {
    routerConfig.routes = routerConfig.routes
      .map((pathConfig) => {
        const { path, meta } = pathConfig;
        const trackingType = get(meta, 'tracking.type');
        const checkoutPathPattern = /^\/(cart|configuration)/;
        const checkoutTrackingType = /^(checkout pages|configuration pages)$/;
        const isCheckoutPath = !!path.match(checkoutPathPattern) ||
          (trackingType && !!trackingType.match(checkoutTrackingType));
        if (isCheckoutPath) {
          return {
            path,
            redirect: { name: states.srp.name },
            ...(
              pathConfig.children ?
                {
                  children: [{ path: '*', redirect: { name: states.srp.name } }]
                }
                : {}
            )
          };
        }
        return pathConfig;
      });
  }

  return new VueRouter(routerConfig);
}
