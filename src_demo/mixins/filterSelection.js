import debounce from 'lodash/debounce';

export default {
  methods: {
    changeFilter({ filterCode, filterValue }) {
      this.$log.debug('filterSelectionMixin::changeFilter()', { filterCode, filterValue });

      const selectedFilter = this.filters.find(filter => filter.code === filterCode);
      if (selectedFilter) {
        selectedFilter.value = filterValue;
      }

      this.$customEmit('change-filter', { filterCode, filterValue });
    },
    // eslint-disable-next-line prefer-arrow-callback
    changeFilterDebounced: debounce(function changeFilter(filter) {
      this.changeFilter(filter);
    }, 750),
    clearAllFilters() {
      this.$log.debug('filterSelectionMixin::clearAllFilters()');
      this.$customEmit('clear-all-filters');
    }
  }
};
