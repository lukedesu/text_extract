export default {
  state: {
    isAnonymous: true,
    disableDirectCheckout: true
  },
  mutations: {
    SET_FINCALC_STATE: (state, fincalcState) => {
      state.fincalcState = fincalcState;
    },
    REMOVE_FINANCE_OPTION: (state, option) => {
      const { options } = state.financeOptions;
      options.splice(options.indexOf(option), 1);
    },
    ADD_FINANCE_OPTION: (state, option) => {
      const { options } = state.financeOptions;
      options.unshift(option);
    },
    SET_IS_ANONYMOUS: (state, isAnonymous) => {
      state.isAnonymous = isAnonymous;
    },
    SET_DISABLE_CHECKOUT: (state, disableDirectCheckout) => {
      state.disableDirectCheckout = disableDirectCheckout;
    }
  },
  namespaced: true
};
