<template src="./header.html"></template>
<script>
import { mapState } from 'vuex';
import CoreShopHeader from '@dcp-vue/platform-core/src/components/frame/header/generic/index.vue';

export default {
  extends: CoreShopHeader,

  computed: {
    ...mapState({
      isAnonymous: state => state.overseasConfig.isAnonymous
    })
  }
};
</script>
