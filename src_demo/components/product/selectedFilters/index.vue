<template src="@dcp-vue/platform-core/src/components/product/selectedFilters/generic/selectedFilters.html"></template>

<script>
import { mapState } from 'vuex';
import CoreSelectedFilters from '@dcp-vue/platform-core/src/components/product/selectedFilters/generic/index.vue';
import Enums from '@dcp-vue/platform-core/src/utils/enums.config';

export default {
  extends: CoreSelectedFilters,

  computed: {
    ...mapState({
      postalCode: state => state.search.locationData.postalCode,
      dealerFilter: state => state.search.filters
        .find(({ code }) => code === 'dealer')
    }),

    locationFilter() {
      if (this.dealerFilter && this.dealerFilter.value.length) {
        const numberOfDealers = this.dealerFilter.value.length;
        const { postalCode } = this;
        const country = this.$i18n.t('dcp.country.name');
        return {
          filterCode: this.dealerFilter.code,
          filterLabel: this.$i18n.t('dcp.srp.filters.locationSearch.label.short', {
            numberOfDealers,
            plural: this.$i18n.t('dcp.language.plural'),
            near: postalCode && numberOfDealers ? this.$i18n.t('dcp.language.near') : this.$i18n.t('dcp.language.in'),
            location: postalCode && numberOfDealers ? `${postalCode}, ${country}` : country
          })
        };
      }
      return undefined;
    },

    selectedFilters() {
      const selectedFilters = [];

      this.filters
        .filter(filter => filter.isSelected())
        .forEach((filter) => {
          if (filter.type === Enums.FilterTypes.Slider) {
            const label = filter.label
              .replace('{from}', filter.getFromValue())
              .replace('{to}', filter.getToValue());

            selectedFilters.push({
              filterCode: filter.code,
              filterLabel: label
            });
          } else {
            filter.value.forEach((value) => {
              const selectedOption = filter.options.find(option => option.value === value);

              if (selectedOption) {
                selectedFilters.push({
                  filterCode: filter.code,
                  filterLabel: selectedOption.name,
                  filterValue: selectedOption.value
                });
              }
            });
          }
        });

      return [...selectedFilters, ...(this.locationFilter ? [this.locationFilter] : [])];
    }
  },

  methods: {
    clearFilter(filterOption) {
      this.$log.debug('DcpSelectedFiltersWidget::clearFilter()');

      const selectedFilter = this.filters.find(filter => filter.code === filterOption.filterCode);

      if (selectedFilter && selectedFilter.type === Enums.FilterTypes.MultiSelect) {
        const newValue = selectedFilter.value.slice();
        const selectedOptionIndex = newValue.indexOf(filterOption.filterValue);

        if (selectedOptionIndex !== -1) {
          newValue.splice(selectedOptionIndex, 1);

          this.$customEmit('change-filter', {
            filterCode: selectedFilter.code,
            filterValue: newValue
          });
        }
      }
      if (selectedFilter && selectedFilter.type === Enums.FilterTypes.Slider) {
        this.$customEmit('change-filter', {
          filterCode: selectedFilter.code,
          filterValue: selectedFilter.getResetValue()
        });
      }

      if (filterOption.filterCode === 'dealer') {
        this.$customEmit('change-filter', {
          filterCode: filterOption.filterCode,
          filterValue: []
        });
      }
    },
  }
};
</script>
