<template src="./monthlyRate.html"></template>

<script>
import get from 'lodash/get';
import ModalPopup from '@dcp-vue/platform-core/src/components/utils/modalPopup/index.vue';

export default {
  name: 'monthlyRate',

  components: { ModalPopup },

  props: {
    monthlyRate: Object
  },

  data() {
    return {
      showMonthlyRateBreakdownModal: false
    };
  },

  computed: {
    breakdownItems() {
      return get(this, 'monthlyRate.priceDescription.items', []);
    },

    disclaimers() {
      return this.breakdownItems.filter(item => item.disclaimer);
    },

    isBreakdownAvailable() {
      return !!this.monthlyRate.priceDescription;
    }
  },

  methods: {
    toggleMonthlyRateBreakdownModal(open) {
      if (this.isBreakdownAvailable) {
        this.showMonthlyRateBreakdownModal = open;
      }
    }
  }
};
</script>

<style lang="scss" src="./monthlyRate.scss"></style>
