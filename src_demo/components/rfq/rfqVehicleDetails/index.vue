<template src="@dcp-vue/platform-core/src/components/rfq/rfqVehicleDetails/generic/rfqVehicleDetails.html"></template>
<script>
import _camelCase from 'lodash/camelCase';
import _isEmpty from 'lodash/isEmpty';
import { mapState, mapMutations } from 'vuex';
import DynamicForm from '@dcp-vue/platform-core/src/components/utils/dynamicForm/index.vue';

export default {
  name: 'RfqVehicleDetails',

  components: {
    DynamicForm
  },

  data() {
    return {
      formSchema: {
        type: 'object',
        properties: {},
        required: []
      },
      formData: {},
      uiSchema: [],
      isReady: false
    };
  },

  computed: {
    ...mapState({
      availableVehicleDetailsFields: state => state.overseasConfig.tradeIn.vehicleDetails.fields,
      tradeInRequested: state => state.rfq.tradeInRequested,
      vehicleDetails: state => state.rfq.vehicleDetails
    }),

    // notApplicable is the opposite of tradeInRequested
    notApplicable: {
      get() {
        return !this.tradeInRequested;
      },

      set(newValue) {
        this.tradeInRequested = !newValue;
      }
    }
  },

  methods: {
    ...mapMutations([
      'INIT_RFQ_VEHICLE_DETAILS',
      'SET_RFQ_TRADE_IN',
      'SET_RFQ_VEHICLE_DETAILS'
    ]),

    formUpdated(data) {
      const newData = {};
      let formRedrawIsNecessary = false;

      // firstly handle text fields
      Object.keys(data).forEach((key) => {
        if (key !== 'notApplicable') {
          newData[key] = data[key];
        }
      });

      // next, handle notApplicable checkbox
      if (this.notApplicable !== data.notApplicable) {
        // notApplicable status has changed
        this.SET_RFQ_TRADE_IN(!data.notApplicable);

        // enable / disable form fields
        this.uiSchema.forEach((field) => {
          if (field.component === 'sf-default-input') field.disabled = data.notApplicable;
        });

        // set all text fields to undefined
        Object.keys(newData).forEach((key) => { newData[key] = undefined; });

        // the form must be redrawn to update the enabled / disabled state of the text fields
        formRedrawIsNecessary = true;
      }

      this.SET_RFQ_VEHICLE_DETAILS(newData);
      Object.assign(this.formData, newData, { notApplicable: data.notApplicable });

      this.setReadyState();

      if (formRedrawIsNecessary) {
        // let the checkbox animation run before redrawing the form
        setTimeout(() => {
          this.redrawForm();
        }, 500);
      }
    },

    nextStep() {
      this.$log.debug('RfqVehicleDetails::next()');
      this.$customEmit('next-step');
    },

    setReadyState() {
      this.isReady = this.notApplicable || Object.keys(this.vehicleDetails).every(key => this.vehicleDetails[key] !== undefined);
    },

    redrawForm() {
      this.$log.debug('RfqVehicleDetails::redrawForm()');

      if (this.$el && this.$el.querySelector('.wb2-form')) {
        // we need to tell the dynamic form component to re-render
        this.$el.querySelector('.wb2-form').dispatchEvent(new CustomEvent('schemaFormRedraw'));
      }
    }
  },

  created() {
    this.$log.debug('RfqVehicleDetails::created()');

    if (_isEmpty(this.vehicleDetails)) {
      this.INIT_RFQ_VEHICLE_DETAILS(this.availableVehicleDetailsFields.map(field => _camelCase(field)));
    }

    // if rfqTradeIn isn't defined yet, set the initial value to true
    if (this.rfqTradeIn === undefined) {
      this.SET_RFQ_TRADE_IN(true);
    }

    // build form based on overseas config
    const properties = {};
    const required = [];
    const formData = {};
    const uiSchema = [];

    this.availableVehicleDetailsFields.forEach((field) => {
      // get field in camelCase format
      const fieldCC = _camelCase(field);

      properties[fieldCC] = {
        type: 'string'
      };

      required.push(fieldCC);

      formData[fieldCC] = this.vehicleDetails[fieldCC];
      formData.notApplicable = this.notApplicable;

      // add input field
      uiSchema.push({
        component: 'sf-default-input',
        disabled: !!this.notApplicable,
        key: fieldCC,
        type: 'string',
        label: this.$i18n.t(`dcp.rfq.vehicleDetails.field.${fieldCC}.label`),
        testId: `trade-in-vehicle-details__${field}`
      });
    });

    // add notApplicable checkbox
    uiSchema.push({
      component: 'sf-checkbox',
      disabled: false,
      key: 'notApplicable',
      label: this.$i18n.t('dcp.rfq.vehicleDetails.notApplicable')
    });

    this.formSchema.properties = properties;
    this.formSchema.required = required;
    this.formData = formData;
    this.uiSchema = uiSchema;

    this.setReadyState();
  }
};
</script>
<style src="@dcp-vue/platform-core/src/components/rfq/rfqVehicleDetails/generic/rfqVehicleDetails.scss" lang="scss"></style>
<style lang="scss">
  // swap checkbox and label
  .dcp-rfq-vehicle-details {
    .wb2-sel-checkbox-label {
      padding-left: 0;
      padding-right: calc(24px + var(--wb2-spacing-scale-xxs));

      &::after,
      &::before {
        left: 100%;
      }
    }
  }
</style>
