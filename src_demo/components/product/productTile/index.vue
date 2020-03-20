<template src="./productTile.html"></template>
<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import CoreProductTileComponent from '@dcp-vue/platform-core/src/components/product/productTile/generic/index.vue';
import MonthlyRate from '../../utils/monthlyRate/index.vue';
// [OTOS-1169]: remove emico footnote on SRP for now
// import emicoFootnote from '../../../mixins/emicoFootnote';

export default {
  extends: CoreProductTileComponent,

  inject: ['locationFootnoteRefs'],

  components: { MonthlyRate },

  computed: {
    ...mapState({
      hideDealerLocation: state => state.overseasConfig.productTile.hidden.dealerLocation,
      hideDealerName: state => state.overseasConfig.productTile.hidden.dealerName,
      hideMonthlyRate: state => state.overseasConfig.productTile.hidden.monthlyRate,
      hidePrice: state => state.overseasConfig.productTile.hidden.price
    }),

    showDealer() {
      return this.showDealerName || this.showDealerLocation;
    },

    showDealerLocation() {
      return !!(!this.hideDealerLocation && get(this, 'product.pointOfServiceFormattedAddress', false));
    },

    showDealerName() {
      return !!(!this.hideDealerName && get(this, 'product.pointOfServiceDisplayName', false));
    },

    showMonthlyRate() {
      return !!(!this.hideMonthlyRate && get(this, 'product.monthlyRate.formattedValue', false));
    },

    showPrice() {
      return !!(!this.hidePrice && get(this, 'product.price.formattedValue', false));
    }
  },

  created() {
    this.$log.debug('ProductTile::created() - MP');

    // [OTOS-1169]: for now the dealer locator disclaimer isn't to be shown on SRP
    // this.disclaimerFootnote = '';
    this.$clearFootnotesForProducer('ProductTileDisclaimer');
  },

  data() {
    return {
      // [OTOS-1169] Prevent Vue template warnings
      emicoFootnote: undefined
    };
  },

  filters: {
    removeDecimal(priceString) {
      // remove decimal place
      const regExpDecimal = /(.*)([.,]00)([\D]|$)/;

      return priceString.replace(regExpDecimal, '$1$3');
    }
  }
};
</script>
