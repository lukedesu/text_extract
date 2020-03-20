import _get from 'lodash/get';
import store from '@dcp-vue/platform-core/src/store/index';

const areVehicleDetailsConfigured = () => _get(store, 'state.overseasConfig.tradeIn.vehicleDetails.fields', []).length;

export default {
  initial: 'rfqAdditionalServices',
  states: {
    rfqAdditionalServices: {
      on: {
        NEXT: 'rfqFinanceOptions'
      }
    },
    rfqFinanceOptions: {
      on: {
        NEXT: [{
          target: 'rfqVehicleDetails',
          cond: () => areVehicleDetailsConfigured()
        }, {
          target: 'rfqContact',
          cond: () => !areVehicleDetailsConfigured()
        }],
        PREVIOUS: 'rfqAdditionalServices'
      }
    },
    rfqVehicleDetails: {
      on: {
        NEXT: 'rfqContact',
        PREVIOUS: 'rfqFinanceOptions'
      }
    },
    rfqContact: {
      on: {
        PREVIOUS: 'rfqVehicleDetails'
      },
      type: 'final'
    }
  }
};
