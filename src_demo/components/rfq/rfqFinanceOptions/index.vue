<template src="@dcp-vue/platform-core/src/components/rfq/rfqFinanceOptions/generic/rfqFinanceOptions.html"></template>
<script>
import { mapState } from 'vuex';
import rfqFinanceOptions from '@dcp-vue/platform-core/src/components/rfq/rfqFinanceOptions/generic/index.vue';

export default {
  extends: rfqFinanceOptions,
  computed: {
    ...mapState({
      financeOptions: state => state.overseasConfig.financeOptions
    }),
    _config() {
      return {
        formSchema: this.formSchema,
        uiSchema: [
          {
            component: 'sf-radio-card',
            disabled: false,
            key: 'code',
            options: ((this.financeOptions || {}).options || []).map(option => ({
              /* eslint-disable */
              label: `
                <div class="dcp-rfq-finance-options-chooser__option">
                  <p class="dcp-rfq-finance-options-chooser-option__label">${this.$t('dcp.rfq.financeOptions.option.' + option + '.label')}</p>
                  ${this.$te('dcp.rfq.financeOptions.option.' + option + '.description') ? '<p class="dcp-rfq-finance-options-chooser-option__description">' + this.$t('dcp.rfq.financeOptions.option.' + option + '.description') + '</p>' : ''}
                </div>`,
              /* eslint-enable */
              value: option,
              testId: `rfq-finance-option__${option}`
            }))
          }
        ]
      };
    }
  }
};
</script>
<style lang="scss">
.dcp-rfq-finance-options-chooser-option__description {
  @include wb2_type_copy;

  color: $wb2_color_grey;
}
</style>
