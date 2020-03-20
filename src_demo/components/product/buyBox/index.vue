<template lang="html" src="./buyBox.html"></template>

<script>
import buyBox from '@dcp-vue/platform-core/src/components/product/buyBox/generic/index.vue';
import { mapState } from 'vuex';
import get from 'lodash/get';
import MonthlyRate from '../../utils/monthlyRate/index.vue';

export default {
  extends: buyBox,

  components: { MonthlyRate },

  props: {
    pageFootnotes: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      buyBoxPriceFootnote: ''
    };
  },

  created() {
    // [OTOS-1177] for now we have to remove BuyBox footnotes from core and use configured footnote instead
    this.$clearFootnotesForProducer('BuyBox');

    // first configured footnote will be used here
    // eslint-disable-next-line prefer-destructuring
    this.buyBoxPriceFootnote = this.pageFootnotes[0];
  },

  computed: {
    ...mapState({
      disableDirectCheckout: state => get(state, 'overseasConfig.disableDirectCheckout', true),
      hideMonthlyRate: state => get(state, 'overseasConfig.pdp.hidden.monthlyRate', false)
    }),

    disableContactButton() {
      return this.isOutOfStock;
    },

    disableRequestForQuoteButton() {
      return this.isOutOfStock;
    },

    isOutOfStock() {
      return get(this.vehicle, 'stock.stockLevel', 0) === 0;
    },

    showMonthlyRate() {
      return !!(!this.hideMonthlyRate && get(this, 'vehicle.monthlyRate.formattedValue', false));
    }
  }
};
</script>
<style lang="scss">
.dcp-buy-box {
  &__price {
    .mp-monthly-rate {
      margin: 0;
    }
  }
}
</style>
