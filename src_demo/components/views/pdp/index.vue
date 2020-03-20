<template lang="html" src="./pdp.html"></template>

<script>
import { mapState, mapMutations } from 'vuex';
import get from 'lodash/get';
import pdp from '@dcp-vue/platform-core/src/components/views/pdp/generic/index.vue';
import pageFootnotes from '../../../mixins/pageFootnotes';
import rfqContact from '../../rfq/rfqContact/index.vue';

export default {
  extends: pdp,

  mixins: [pageFootnotes],

  provide() {
    return {
      checkRfqMode: () => this.checkRfqMode
    };
  },

  data() {
    return {
      isRfqMode: true
    };
  },

  components: {
    rfqContact
  },

  created() {
    this.$clearFootnotesForProducer('ProductDetailsPageDisclaimer');
  },

  computed: {
    ...mapState({
      disableDirectCheckout: state => state.overseasConfig.disableDirectCheckout,
      footnotesConfig: state => state.overseasConfig.pdp.footnotes
    }),
    ...mapState('overseasConfig', {
      hasFinancing: ({ financeOptions }) => financeOptions.options.indexOf('financing') > -1
    }),

    vehicleData() {
      return {
        length: get(this.product, 'length'),
        maxWeight: get(this.product, 'maxWeight'),
        color: get(this.product, 'color'),
        upholstery: get(this.product, 'upholstery'),
        // eslint-disable-next-line radix
        powerInKw: `${get(this.product, 'powerInKw')} kW`,
        fuelType: get(this.product, 'fuelType'),
        transmission: get(this.product, 'transmission')
      };
    },

    checkRfqMode() {
      return this.isRfqMode;
    },

    isOutOfStock() {
      return get(this.product, 'stock.stockLevel', 0) < 1;
    }
  },

  methods: {
    ...mapMutations('overseasConfig', ['SET_FINCALC_STATE', 'REMOVE_FINANCE_OPTION', 'ADD_FINANCE_OPTION']),

    openContactModal() {
      this.isRfqMode = false;
      this.showRequestOfferModal = true;
    },

    triggerRequestQuote() {
      this.isRfqMode = true;
      this.showRequestOfferModal = true;
    },

    setFinancingOption() {
      if (this.fincalcState === 'error' && this.hasFinancing) {
        this.REMOVE_FINANCE_OPTION('financing');
      } else if (this.fincalcState === 'ready' && !this.hasFinancing) {
        this.ADD_FINANCE_OPTION('financing');
      }
    }
  },

  watch: {
    fincalcState: {
      handler() {
        this.SET_FINCALC_STATE(this.fincalcState);
        this.setFinancingOption();
      },
      immediate: true
    }
  }
};
</script>
