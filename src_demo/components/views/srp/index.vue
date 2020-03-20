<template lang="html" src="./srp.html"></template>

<script>
import { mapState } from 'vuex';
import srp from '@dcp-vue/platform-core/src/components/views/srp/generic/index.vue';
import pageFootnotes from '../../../mixins/pageFootnotes';
import { getSearchFilters } from '../../../utils/utils-srp';

export default {
  extends: srp,

  mixins: [pageFootnotes],

  computed: {
    ...mapState({
      footnotesConfig: state => state.overseasConfig.srp.footnotes
    }),
    // OTOS-976
    filters() {
      return this.$store.state.search.filters
        .filter(getSearchFilters);
    },
  },
  provide() {
    return {
      locationFootnoteRefs: this.footnotesConfig
        .reduce((acc, config, index) => {
          if (config.includeReference) {
            return [
              ...acc,
              this.pageFootnotes[index].referenceNumber
            ];
          }
          return acc;
        }, [])
    };
  }
};
</script>
