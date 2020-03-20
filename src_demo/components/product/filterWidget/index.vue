<template src="./filterWidget.html" />

<script>
import CoreFilterWidget from '@dcp-vue/platform-core/src/components/product/filterWidget/generic/index.vue';
import FilterLocation from '../../filters/filterLocation/index.vue';
import Enums from '../../../utils/enums.config';
import FilterSelectionMixin from '../../../mixins/filterSelection';

export default {
  extends: CoreFilterWidget,
  mixins: [FilterSelectionMixin],
  components: { FilterLocation },
  computed: {
    filterTabs() {
      return [
        ...this.generalFilters
          .filter(filter => filter.priority > 0)
          .map(filter => filter.name),
        'Location'
      ];
    }
  },
  data() {
    return {
      Enums
    };
  }
};
</script>
