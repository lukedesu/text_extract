<template lang="html" src="./imageSlider.html"></template>

<script>
import CoreImageSlider from '@dcp-vue/platform-core/src/components/product/imageSlider/generic/index.vue';

export default {
  extends: CoreImageSlider,
  props: {
    isOutOfStock: {
      type: Boolean,
      default: true
    }
  }
};
</script>
