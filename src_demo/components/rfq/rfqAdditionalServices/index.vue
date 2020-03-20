<template>
<div class="dcp-rfq-additional-services">
  <h2 class="dcp-rfq-additional-services__heading">
    {{$t('dcp.rfq.additionalServices.title')}}
  </h2>
  <p class="dcp-rfq-additional-services__description">
    {{$t('dcp.rfq.additionalServices.description')}}
  </p>

  <dynamic-form
    class="dcp-rfq-additional-services__selection dcp-rfq-additional-services-selection"
    :form-data="formData"
    :form-schema="formSchema"
    :is-dark-bg="false"
    :ui-schema="uiSchema"
    @change="updateFormData">
  </dynamic-form>

  <div class="dcp-rfq-additional-services__footnotes dcp-shop__footnotes">
    <ul id="additional-services-footnotes" class="dcp-footnote-list">
      <li
        class="dcp-footnote-list__item"
        v-bind:key="footnote.code"
        v-for="footnote in footnotes">
        <span>{{footnote.reference}} </span>
        <span
          v-html="footnote.text"></span>
      </li>
    </ul>
  </div>

  <div class="dcp-rfq-additional-services__button-container dcp-rfq-additional-services-button-container">
    <button
      class="dcp-rfq-additional-services-button-container__button wb2-btn-01"
      @click="nextStep()"
      data-test-id="dcp-rfq-additional-services-button-container__button-next">
      {{ $t('dcp.rfq.additionalServices.buttonNextLabel') }}
    </button>
  </div>
</div>
</template>
<script>
import _camelCase from 'lodash/camelCase';
import _pickBy from 'lodash/pickBy';
import { mapMutations, mapState } from 'vuex';
import DynamicForm from '@dcp-vue/platform-core/src/components/utils/dynamicForm/index.vue';

export default {
  name: 'RfqAdditionalServices',
  components: { DynamicForm },
  data() {
    return {
      formData: {},
      formSchema: {
        type: 'object',
        properties: {},
        required: []
      }
    };
  },
  computed: {
    ...mapState({
      availableAdditionalServices: state => state.overseasConfig.additionalServices,
      selectedAdditionalServices: state => state.rfq.additionalServices
    }),
    uiSchema() {
      return (this.additionalServices || []).map(service => ({
        component: 'sf-checkbox',
        disabled: false,
        key: service.code,
        label: service.title,
        hint: service.description
      }));
    }
  },
  methods: {
    ...mapMutations([
      'SET_ADDITIONAL_SERVICE'
    ]),

    nextStep() {
      this.$log.debug('RfqAdditionalServices::next()');
      this.$emit('next-step');
    },

    updateFormData(value) {
      this.$log.debug('RfqAdditionalServices::updateFormData()', value);

      // We're using pickBy to only store truthy values. If a checkbox
      // value was deselected, we completely remove it from the object being
      // send to the store.
      this.SET_ADDITIONAL_SERVICE(_pickBy(value));
    }
  },
  created() {
    this.$log.debug('RfqAdditionalServices::created()');

    // Load available additional services and add translations
    this.additionalServices = ((this.availableAdditionalServices || {}).entries || []).map(code => ({
      code,
      description: this.$i18n.t(`dcp.rfq.additionalServices.entry.${_camelCase(code)}.description`),
      title: this.$i18n.t(`dcp.rfq.additionalServices.entry.${_camelCase(code)}.title`)
    }));

    // Load footnotes
    this.footnotes = ((this.availableAdditionalServices || {}).footnotes || []).map(code => ({
      code,
      reference: this.$i18n.t(`dcp.rfq.additionalServices.footnotes.entry.${_camelCase(code)}.reference`),
      text: this.$i18n.t(`dcp.rfq.additionalServices.footnotes.entry.${_camelCase(code)}.text`)
    }));

    // Load previously selected additional services
    this.formData = this.selectedAdditionalServices;
  }
};
</script>
<style lang="scss">
.dcp-rfq-additional-services {
  display: block;

  &__heading {
    @include wb2_type_hl-m;
    @include wb2-spacing('margin-bottom', 'xxs');

    color: $wb2_color_obsidian;
  }

  &__description {
    @include wb2_type_copy;
    @include wb2-spacing('margin-bottom', 's');

    color: $wb2_color_grey;
  }
}

.dcp-rfq-additional-services-button-container {
  @include wb2-spacing('margin-top', 's');

  @media (min-width: map-get($wb2-mq-scale, 'mq4')) {
    display: flex;
    justify-content: flex-end;
  }

  @media (max-width: map-get($wb2-mq-scale, 'mq4')) {
    &__button {
      width: 100%;
    }
  }
}

.dcp-rfq-additional-services__footnotes {
  .dcp-footnote-list {
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
