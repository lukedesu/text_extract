import states from './fsmStates.json';
import store from './store';

// Here we define sub state machines
const productConfigurationMachineConfig = {
  initial: states.recommendations.name,
  states: {
    [states.recommendations.name]: {
      on: {
        NEXT: states.tradeInYN.name
      }
    },
    [states.tradeInYN.name]: {
      on: {
        NEXT: [
          {
            target: states.vinYN.name,
            cond: () => store.getters.tradeInRequested === true
          },
          {
            target: states.downstreamPaymentOption.name,
            cond: () => store.getters.tradeInRequested === false
          }
        ],
        PREVIOUS: states.recommendations.name
      }
    },
    [states.vinYN.name]: {
      on: {
        NEXT: [
          {
            target: states.vinInput.name,
            cond: () => store.getters.vinProvided === true
          },
          {
            target: states.vehicleFunnel.name,
            cond: () => store.getters.vinProvided === false
          }
        ],
        PREVIOUS: states.tradeInYN.name
      }
    },
    [states.vinInput.name]: {
      on: {
        NEXT: states.tradeInVehicleResults.name,
        PREVIOUS: states.vinYN.name
      }
    },
    [states.vehicleFunnel.name]: {
      on: {
        NEXT: states.tradeInVehicleResults.name,
        PREVIOUS: states.vinYN.name
      }
    },
    [states.tradeInVehicleResults.name]: {
      on: {
        NEXT: states.tradeInVehicleDetails.name,
        PREVIOUS: [
          {
            target: states.vinInput.name,
            cond: () => store.getters.vinProvided === true
          },
          {
            target: states.vehicleFunnel.name,
            cond: () => store.getters.vinProvided === false
          }
        ]
      }
    },
    [states.tradeInVehicleDetails.name]: {
      on: {
        NEXT: states.tradeInQuote.name,
        PREVIOUS: states.tradeInVehicleResults.name
      }
    },
    [states.tradeInQuote.name]: {
      on: {
        NEXT: states.downstreamPaymentOption.name,
        PREVIOUS: states.tradeInVehicleDetails.name
      },
      // When a child state does not handle an event, that event is propagated
      // up to its parent state to be handled. Here, the 'NEXT' event is handled
      // by the trade in parent.
    },
    [states.downstreamPaymentOption.name]: {
      on: {
        PREVIOUS: [
          {
            target: states.tradeInYN.name,
            cond: () => !store.state.tradeIn.appraisalValue.value ||
              store.getters.tradeInRequested === false
          },
          {
            target: states.tradeInQuote.name,
            cond: () => !!store.state.tradeIn.appraisalValue.value &&
              store.getters.tradeInRequested === true
          }
        ],
        NEXT: [
          {
            target: states.recommendations.name,
            cond: () => store.getters.downstreamPaymentOptionUserSelection !== 'FINANCING'
          },
          {
            target: states.downstreamPaymentCalculation.name,
            cond: () => store.getters.downstreamPaymentOptionUserSelection === 'FINANCING'
          }
        ]
      }
    },
    [states.downstreamPaymentCalculation.name]: {
      on: {
        PREVIOUS: states.downstreamPaymentOption.name
      }
    }
  }
};

// Main state machine
export const finiteStateMachineConfig = {
  initial: states.home,
  states: {
    [states.home.name]: {
      on: {
        NEXT: states.configuration.name
      }
    },
    [states.configuration.name]: {
      on: {
        NEXT: states.cart.name,
        PREVIOUS: states.home.name
      },
      // Add substates to the trade in
      ...productConfigurationMachineConfig
    },
    [states.cart.name]: {
      on: {
        NEXT: [{
          target: states.loginRegister.name,
          cond: () => store.getters.isAuthenticated === false
        }, {
          target: states.payment.name,
          cond: () => store.getters.isAuthenticated === true
        }],
        PREVIOUS: states.configuration.name
      }
    },
    [states.loginRegister.name]: {
      on: {
        NEXT: states.payment.name,
        PREVIOUS: states.cart.name
      }
    },
    [states.payment.name]: {
      on: {
        NEXT: states.cartOverview.name,
        PREVIOUS: states.cart.name
      }
    },
    [states.cartOverview.name]: {
      on: {
        NEXT: states.confirmation.name,
        PREVIOUS: states.payment.name
      }
    },
    [states.confirmation.name]: {
      on: {
        PREVIOUS: states.cartOverview.name
      },
      type: 'final'
    }
  }
};
