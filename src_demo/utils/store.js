import Vue from 'vue';
import Vuex from 'vuex';
import { storeConfig } from '@dcp-vue/platform-core/src/store';
import { getStorageItem, setStorageItem } from '@dcp-vue/platform-core/src/utils/persistence';
import overseasConfig from '../store/modules/overseasConfig';

Vue.use(Vuex);

// This file can be used to add new functionality to the store or to modify
// existing functionality. The following example shows how to add more
// functionality to an existing store action.

// const cartActionsOriginal = clone(storeConfig.modules.cart.actions);
// storeConfig.modules.cart.actions.addToCart = (...args) => {
//   // extend the action that of adding something to the cart
//   return cartActionsOriginal.addToCart.apply(this, args);
// };

// RFQ
storeConfig.modules.rfq.state.additionalServices = {};
storeConfig.modules.rfq.state.contactData = {};

storeConfig.modules.rfq.mutations.SET_ADDITIONAL_SERVICE = (state, services) => {
  // services is an object with the product code as key and true as value
  state.additionalServices = services;
};

storeConfig.modules.rfq.mutations.SET_CONTACT_DATA = (state, contactData) => {
  state.contactData = contactData;
};

storeConfig.modules.rfq.state.vehicleDetails = {};

storeConfig.modules.rfq.mutations.INIT_RFQ_VEHICLE_DETAILS = (state, fields) => {
  fields.forEach((field) => {
    // enable reactivity of new properties
    Vue.set(state.vehicleDetails, field, undefined);
  });
};

storeConfig.modules.rfq.mutations.SET_RFQ_VEHICLE_DETAILS = (state, details) => {
  Object.keys(details).forEach((key) => {
    state.vehicleDetails[key] = details[key];
  });
};

storeConfig.modules.rfq.getters.getRfqVehicleDetails = state => state.vehicleDetails;

const getSearchModule = () => {
  // Search: location

  // state
  const SEARCH_POSTAL_CODE = 'search-postal-code';
  const SEARCH_DISTANCE_FROM = 'search-distance-from';
  const getSearchPostalCode = () => (
    String(getStorageItem(SEARCH_POSTAL_CODE) || '')
  );
  const getSearchDistanceFrom = () => (
    String(getStorageItem(SEARCH_DISTANCE_FROM) || '25')
  );
  const locationSearchState = {
    locationData: {
      postalCode: getSearchPostalCode(),
      distanceFrom: getSearchDistanceFrom()
    }
  };
  const searchState = {
    ...storeConfig.modules.search.state,
    ...locationSearchState
  };

  // mutations
  const locationSearchMutations = {
    SET_LOCATION_SEARCH_POSTAL_CODE: (state, postalCode) => {
      state.locationData = {
        ...state.locationData,
        postalCode
      };
      setStorageItem(SEARCH_POSTAL_CODE, postalCode, true);
    },
    SET_LOCATION_SEARCH_DISTANCE_FROM: (state, distanceFrom) => {
      state.locationData = {
        ...state.locationData,
        distanceFrom
      };
      setStorageItem(SEARCH_DISTANCE_FROM, distanceFrom, true);
    }
  };
  const searchMutations = {
    ...storeConfig.modules.search.mutations,
    ...locationSearchMutations
  };

  return {
    ...storeConfig.modules.search,
    state: searchState,
    mutations: searchMutations
  };
};

export const makeStore = (config = overseasConfig) => (
  new Vuex.Store({
    ...storeConfig,
    modules: {
      ...storeConfig.modules,
      search: getSearchModule(),
      overseasConfig: {
        ...overseasConfig,
        ...config
      }
    }
  })
);

const modules = {
  ...storeConfig.modules,
  overseasConfig
};

const store = new Vuex.Store({
  ...storeConfig,
  modules
});

export default store;
