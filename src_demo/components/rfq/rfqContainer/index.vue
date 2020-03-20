<template src="@dcp-vue/platform-core/src/components/rfq/rfqContainer/generic/rfqContainer.html"></template>
<script>
import { mapGetters, mapState } from 'vuex';
import quotesApi from '@dcp-vue/platform-core/src/utils/api/quotes';
import { getConfiguration } from '@dcp-vue/platform-core/src/utils/configuration';
import CoreRfqContainerComponent from '@dcp-vue/platform-core/src/components/rfq/rfqContainer/generic/index.vue';
import get from 'lodash/get';
import rfqFsm from './rfqFsm';
import RfqAdditionalServices from '../rfqAdditionalServices/index.vue';
import overseasQuotesApi from '../../../utils/api/quotes';

export default {
  extends: CoreRfqContainerComponent,

  inject: ['checkRfqMode'],

  components: {
    RfqAdditionalServices
  },

  computed: {
    ...mapState({
      additionalServices: state => state.rfq.additionalServices,
      availableAdditionalServices: state => state.overseasConfig.additionalServices,
      contactData: state => state.rfq.contactData,
      tradeInRequested: state => state.rfq.tradeInRequested,
      sfdcConsentMapping: state => state.overseasConfig.contactDetails.sfdcConsentMapping,
    }),

    doAdditionalServicesExist() {
      const { availableAdditionalServices: services } = this;

      return services && services.entries && services.entries.length;
    },

    tradeInNegotiationDetailsString() {
      let result = '';

      const rfqTradeInRequested = this.getRfqTradeInRequested();
      const rfqVehicleDetails = this.getRfqVehicleDetails();

      if (rfqTradeInRequested && Object.keys(rfqVehicleDetails).length) {
        result = Object.keys(rfqVehicleDetails).reduce((accu, key) => `${accu}${this.$t(`dcp.rfq.vehicleDetails.field.${key}.label`)} :${rfqVehicleDetails[key]}\n`,
          `${this.$t('dcp.form.field.tradeInRequested.label')}${rfqTradeInRequested}\n`);
      }

      return result;
    },

    _config() {
      const isRfqMode = this.checkRfqMode();

      let rfqComponents = [
        'rfqAdditionalServices',
        'rfqFinanceOptions',
        'rfqVehicleDetails',
        'rfqContact',
        'rfqConfirmation'
      ];
      let rfqInitialStage = this.doAdditionalServicesExist ? 'rfqAdditionalServices' : 'rfqFinanceOptions';
      let stateMachineDescription = rfqFsm;

      if (!isRfqMode) {
        rfqComponents = ['rfqContact'];
        rfqInitialStage = 'rfqContact';
        stateMachineDescription = {};
      }

      return {
        rfqComponents,
        rfqInitialStage,
        stateMachineDescription
      };
    }
  },

  methods: {
    ...mapGetters([
      'getRfqVehicleDetails'
    ]),

    nextStep() {
      this.$log.debug('RfqContainer::nextStep()');

      // OTOS-621 due to contact me form need additional header x-session-quote-type: CONTACT
      const isRfqMode = this.checkRfqMode();
      const params = this.checkRfqMode() ? null : {
        headers: {
          'x-session-quote-type': 'CONTACT'
        }
      };

      if (this.stateMachine) {
        let rfqCurrentStepId = this.rfqStages.find(rfqStage => rfqStage.show).component;
        const nextStepId = this.stateMachine.transition(rfqCurrentStepId, 'NEXT').value;

        // compare next and current states to avoid self-transition (default in xstate)
        if (isRfqMode && rfqCurrentStepId !== nextStepId) {
          rfqCurrentStepId = nextStepId;
          this.modalContentTrigger(this._config.rfqComponents.indexOf(rfqCurrentStepId));
        } else {
          // last step reached
          this.showGlobalLoadingSpinner();

          let quoteCreationPromise = Promise.resolve();

          // if not quote creation has been triggered by child components
          // it must be finally triggered here
          if (!this.quoteId) {
            quoteCreationPromise = this.createQuote();
          }

          quoteCreationPromise.then(() => overseasQuotesApi.patchQuote(this.quoteId, this.buildQuote(), params)).then(() => {
            this.showSuccessHint = true;
            this.countDownSuccessHint();
            this.$log.debug('RfqContainer::nextStep() -> Quote is successfully patched');
          })
            .catch(() => {
              this.showErrorHint = true;
              this.$log.error('RfqContainer::nextStep() -> Quote cannot be patched');
            })
            .finally(() => {
              this.hideGlobalLoadingSpinner();
            });
        }
      } else {
        this.$log.warn('RfqContainer::nextStep() -> State machine is not found.');
      }
    },

    createQuote() {
      this.$log.debug('RfqContainer::createQuote()');

      const params = this.checkRfqMode() ? null : {
        headers: {
          'x-session-quote-type': 'CONTACT'
        }
      };

      return quotesApi.createQuote(this.productCode, params)
        .then((resolvedQuote) => {
          this.SET_QUOTE(resolvedQuote);
          this.quoteId = resolvedQuote.code;
        })
        .catch(() => {
          this.$log.error('RfqContainer::createQuote() -> Quote cannot be created');
        });
    },

    buildQuote() {
      this.$log.debug('RfqContainer::buildQuote()');

      const { lang, shopCountry } = getConfiguration('lang', 'shopCountry');

      const entries = [{
        product: { code: this.productCode },
        negotiationDetails: this.vehicleNegotiationDetailsString
      }];

      if (this.tradeInRequested) {
        entries.push({
          product: { code: 'trade-in' },
          negotiationDetails: this.tradeInNegotiationDetailsString
        });
      }

      Object.keys(this.additionalServices).forEach((code) => {
        entries.push({
          product: { code }
        });
      });

      // OTOS-621 contact me flow only accept consent data format: "consentCodes":["privacyPolicy"]
      // const consentCodes = [];
      const { consentDataPrivacy, consentMarketing } = this.contactData;
      const consentDataPrivacySfdcFields = get(this.sfdcConsentMapping, 'consentDataPrivacy', []);
      const consentMarketingSfdcFields = get(this.sfdcConsentMapping, 'consentMarketing', []);
      this.contactData.consentCodes = [
        ...(consentDataPrivacy ? consentDataPrivacySfdcFields : []),
        ...(consentMarketing ? consentMarketingSfdcFields : [])
      ];

      const quote = {
        status: 'QUOTE_REQUESTED',
        language: lang,
        country: shopCountry,
        entries,
        downstreamPaymentMode: ['FINANCING', 'LEASING'].includes(this.getRfqFinanceOption()) ?
          'FINANCIAL_SERVICE' :
          'DIRECT_PAYMENT',
        financialCalculatorProductType: ['FINANCING', 'LEASING'].includes(this.getRfqFinanceOption()) ?
          this.getRfqFinanceOption() :
          undefined,
        requestDetails: {
          ...this.contactData,
          countryIsocode: shopCountry,
          negotiationDetails: this.getRfqPersonalMessage(),
          billingAddress: true,
          // TODO: TEMPFIX TO BE REMOVED WHEN OTOS-1253 IS COMPLETE
          nationalIdNumber: '00000000'
        }
      };

      // Get the Adobe Marketing Cloud Visitor ID and add it to the Backend request
      // so that the backend can use it on the CUSMES e-mail links to the offer page.
      try {
        quote.mcvid = window.adobe_dtm_function_return_mcvid();
      } catch (err) {
        this.$log.warn('RfqContainer::buildQuote() -> Adobe DTM library is not available');
      }

      return quote;
    }
  }
};
</script>
