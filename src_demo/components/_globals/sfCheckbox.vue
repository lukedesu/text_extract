<template>
<div
  class="wb2-form__field wb2-sel-checkbox"
  :class="{
    'wb2-sel-checkbox--error': !!error,
    'wb2-sel-checkbox--disabled': !!disabled
    }">
  <p
    class="wb2-sel-checkbox__headline"
    v-if="heading">
    {{ headingWithHint }}
  </p>
  <span
    class="wb2-sel-checkbox__hint"
    v-if="hint">
    {{ hint }}
  </span>
  <input
    class="wb2-sel-checkbox__input wb2-sel-checkbox-input"
    type="checkbox"
    :id="uniqueId"
    :disabled="disabled"
    v-model="checked" />
  <label class="wb2-sel-checkbox__label wb2-sel-checkbox-label" :for="uniqueId" v-html="label"></label>
  <div class="wb2-sel-checkbox__messages">
    <p
      class="wb2-sel-checkbox__messages-error"
      v-show="!!error">
      {{ error }}
    </p>
  </div>
</div>
</template>
<script>
export default {
  name: 'sfCheckbox',
  data() {
    return {
      error: '',
      uniqueId: ''
    };
  },
  model: {
    prop: 'value',
    event: 'input'
  },
  props: {
    disabled: Boolean,
    errorObserver: Function,
    heading: String,
    hint: String,
    label: String,
    vfjsFieldModel: Boolean,
    vfjsFieldRequired: Boolean
  },
  computed: {
    checked: {
      get() {
        return this.vfjsFieldModel;
      },
      set(newValue) {
        this.$log.debug('sfCheckbox::set()', newValue);
        this.$emit('input', newValue);
      }
    },

    headingWithHint() {
      if (this.vfjsFieldRequired) {
        return this.heading;
      }
      return `${this.heading} ${this.$i18n.t('dcp.form.optional')}`;
    }
  },
  created() {
    // create unique id to be able to have multiple
    // radio buttons on the same page
    this.uniqueId = Math.random().toString(36).substr(2, 9);

    this.errorObserver((errorMessage) => {
      this.error = errorMessage;
    });
  }
};
</script>
<style lang="scss">
  .wb2-sel-checkbox {
    &__label {
      display: inline-block;
    }
  }
</style>
