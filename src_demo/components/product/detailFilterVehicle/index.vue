<template lang="html" src="./detailFilterVehicle.html"></template>

<script>
import { mapState } from 'vuex';
import detailFilterVehicle from '@dcp-vue/platform-core/src/components/product/detailFilterVehicle/generic/index.vue';
import { getSearchFilters } from '../../../utils/utils-srp';
import FilterLocation from '../../filters/filterLocation/index.vue';
import FilterSelectionMixin from '../../../mixins/filterSelection';

export default {
  extends: detailFilterVehicle,

  mixins: [FilterSelectionMixin],

  components: { FilterLocation },

  computed: {
    filterGroups() {
      const filterCategories = [
        {
          code: 'vehicle',
          name: this.$i18n.t('dcp.srp.filters.category.car'),
          icon: 'IconCar',
          filters: []
        },
        {
          code: 'price',
          name: this.$i18n.t('dcp.srp.filters.category.price'),
          icon: 'IconFinance',
          filters: []
        },
        {
          code: 'engine',
          name: this.$i18n.t('dcp.srp.filters.category.engine'),
          icon: 'IconEngine',
          filters: []
        },
        {
          code: 'upholstery',
          name: this.$i18n.t('dcp.srp.filters.category.upholstery'),
          icon: 'IconSeat',
          filterNames: [
            'upholstery_polish',
            'upholstery_group'
          ],
          filters: []
        },
        {
          code: 'equipment',
          name: this.$i18n.t('dcp.srp.filters.category.equipment'),
          icon: 'IconWheels',
          filterNames: [
            'grouped_equipments',
            'packages',
            'lines'
          ],
          filters: []
        },
        {
          code: 'color',
          name: this.$i18n.t('dcp.srp.filters.category.color'),
          icon: 'IconColor',
          filterNames: [
            'color_polish',
            'color_group'
          ],
          filters: []
        },
        {
          code: 'location',
          name: this.$i18n.t('dcp.srp.filters.category.location'),
          icon: 'IconLocation',
          filters: [
            ...(this.dealerFilter ? [this.dealerFilter] : [])
          ]
        }
      ];

      this.currentFilters.forEach((filter) => {
        const selectedCategory = filterCategories.find(category => category.code === filter.categoryCode);

        // OTOS-976
        // Only show filters with at least two options
        const isValidMultiSelect = filter.options && filter.options.length > 1;
        const isValidSlider = filter.min && filter.min !== filter.max;
        const isDealerFilter = filter.code === 'dealer';
        if (selectedCategory && (isValidMultiSelect || isValidSlider) && !isDealerFilter) {
          selectedCategory.filters.push(filter);
        }
      });

      return filterCategories
        // OTOS-976
        // Hide empty filter categories
        .filter(filterCategory => filterCategory.filters.length > 0)
        // Sort filters by priority
        .map(filterCategory => ({
          ...filterCategory,
          filters: filterCategory.filters
            .sort((a, b) => a.priority - b.priority)
        }));
    },

    // OTOS 976
    generalFilters() {
      return this.currentFilters
        .filter(filter => filter.code !== 'model' && filter.code !== 'bodyType')
        .filter(getSearchFilters)
        .sort((a, b) => a.priority - b.priority);
    },

    // OTOS 976
    vehicleCategoryFilters() {
      return this.currentFilters
        .filter(filter => filter.code === 'model' || filter.code === 'bodyType')
        .filter(getSearchFilters)
        .sort((a, b) => a.priority - b.priority);
    },

    ...mapState({
      dealerFilter: state => state.search.filters
        .find(({ code }) => code === 'dealer'),
      $_totalResults: state => state.search.paging.totalResults
    }),

    areFiltersSelected() {
      return this.filters.some(filter => filter.isSelected())
        || (this.dealerFilter && this.dealerFilter.value.length);
    }
  },

  watch: {
    currentFilters: {
      handler() {
        this.totalResults = this.$_totalResults;
      },
      deep: true,
      immediate: true
    }
  }
};
</script>
