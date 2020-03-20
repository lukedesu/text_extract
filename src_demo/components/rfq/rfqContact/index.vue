<template lang="html" src="./rfqContact.html"></template>

<script>
import formsApi from '@dcp-vue/platform-core/src/utils/api/forms';
import { getConfiguration } from '@dcp-vue/platform-core/src/utils/configuration';
import rfqContact from '@dcp-vue/platform-core/src/components/rfq/rfqContact/generic/index.vue';
import { mapMutations, mapState } from 'vuex';
import merge from 'lodash/merge';
import get from 'lodash/get';

export default {
  extends: rfqContact,

  inject: ['checkRfqMode'],

  computed: {
    ...mapState({
      isAnonymous: state => state.overseasConfig.isAnonymous,
      contactData: state => state.rfq.contactData,
      contactDetailsConfig: state => state.overseasConfig.contactDetails,
      consentMarketingRequired: state => state.overseasConfig.contactDetails.required.includes('consentMarketing'),
      contactByPhone: state => !state.overseasConfig.contactDetails.hidden.phone
    })
  },

  data() {
    return {
      contactFormSchema: undefined,
      isContactFormReady: false,
      overseasFormData: {
        consentDataPrivacy: false,
        consentMarketing: false
      },
      overseasFormSchema: {
        properties: {
          consentDataPrivacy: {
            type: 'boolean',
            const: true,
            errorMessage: {
              const: this.$t('dcp.form.error.required.consentDataPrivacy')
            }
          },
          consentMarketing: {
            type: 'boolean',
            errorMessage: {
              const: this.$t('dcp.form.error.required.consentMarketing')
            }
          }
        },
        errorMessage: {
          required: {
            consentDataPrivacy: this.$t('dcp.form.error.required.consentDataPrivacy'),
            consentMarketing: this.$t('dcp.form.error.required.consentMarketing')
          }
        }
      },
      uiSchema: [
        {
          component: 'sf-default-input',
          disabled: false,
          key: 'nationalIdNumber',
          label: this.$t('dcp.form.field.nationalIdNumber.label'),
          placeholder: this.$t('dcp.form.field.nationalIdNumber.placeholder'),
          testId: 'rfq-contact__national-id-number',
          readonly: this.$isAuthenticated()
        }, {
          component: 'sf-default-input',
          disabled: false,
          key: 'fullName',
          label: this.$t('dcp.form.field.fullName.label'),
          placeholder: this.$t('dcp.form.field.fullName.placeholder'),
          testId: 'rfq-contact__full-name',
          readonly: this.$isAuthenticated()
        }, {
          component: 'sf-default-input',
          disabled: false,
          key: 'firstName',
          label: this.$t('dcp.form.field.firstName.label'),
          placeholder: this.$t('dcp.form.field.firstName.placeholder'),
          testId: 'rfq-contact__first-name',
          readonly: this.$isAuthenticated()
        }, {
          component: 'sf-default-input',
          disabled: false,
          key: 'lastName',
          label: this.$t('dcp.form.field.lastName.label'),
          placeholder: this.$t('dcp.form.field.lastName.placeholder'),
          testId: 'rfq-contact__last-name',
          readonly: this.$isAuthenticated()
        }, {
          component: 'sf-default-input',
          disabled: false,
          key: 'email',
          label: this.$t('dcp.form.field.email.label'),
          inputmode: 'email',
          testId: 'rfq-contact__email',
          readonly: this.$isAuthenticated()
        },
        {
          component: 'sf-default-input',
          disabled: false,
          key: 'phone',
          label: this.$t('dcp.form.field.phone.label'),
          inputmode: 'tel',
          testId: 'rfq-contact__phone'
        },
        {
          component: 'sf-checkbox',
          disabled: false,
          heading: this.$t('dcp.form.field.consentDataPrivacy.heading'),
          key: 'consentDataPrivacy',
          label: this.$t('dcp.form.field.consentDataPrivacy.label', {
            url: this.$t('dcp.footer.link.privacyPolicy.url')
          }),
          testId: 'rfq-contact__consent-data-privacy'
        },
        {
          component: 'sf-checkbox',
          disabled: false,
          heading: this.$t('dcp.form.field.consentMarketing.heading'),
          key: 'consentMarketing',
          label: this.$t('dcp.form.field.consentMarketing.label'),
          testId: 'rfq-contact__consent-marketing'
        }
      ]
    };
  },

  created() {
    const isRfqMode = this.checkRfqMode();
    this.showGlobalLoadingSpinner();

    this.getFormValidationRules(isRfqMode ? 'quote.request' : 'quote.contact').then((formValidationRules) => {
      this.formData = {
        ...this.formData,
        ...this.overseasFormData,
        // [OTOS-621]: Regional 2020 contact number field is non-togglable from the UI
        contactByPhone: this.contactByPhone
      };

      this.contactFormSchema = this.constructFormSchema(formValidationRules);

      merge(this.contactFormSchema, this.overseasFormSchema);

      merge(this.contactFormSchema.required, get(this.contactDetailsConfig, 'required', []));

      if (this.consentMarketingRequired) {
        this.$set(this.contactFormSchema.properties.consentMarketing, 'const', true);
      }

      const areFieldsHidden = Object.values(this.contactDetailsConfig.hidden).includes(true);
      if (areFieldsHidden) {
        const hiddenFields = Object.keys(this.contactDetailsConfig.hidden)
          .filter(key => this.contactDetailsConfig.hidden[key] === true);
        hiddenFields.forEach((key) => {
          this.$delete(this.formData, key);
          this.uiSchema = this.uiSchema.filter(field => field.key !== key);
        });
      }

      // load contact data if it has been entered before
      if (this.contactData && Object.keys(this.contactData).length > 0) {
        this.formData = this.contactData;
      }

      this.isContactFormReady = true;
      this.hideGlobalLoadingSpinner();
    });
  },

  methods: {
    ...mapMutations([
      'SET_CONTACT_DATA'
    ]),

    /**
     * constructs the form schema based on the form validation rules
     * provided by the backend
     */
    constructFormSchema(formValidationRules) {
      const mapErrorCodeToString = {
        200: 'minLength',
        201: 'maxLength',
        202: 'pattern',
        302: 'required'
      };

      const formSchema = {
        errorMessage: { required: {} },
        properties: {},
        required: get(formValidationRules, 'formSchema.required', []),
        type: 'object'
      };

      // process property objects
      get(formValidationRules, 'formSchema.properties', []).forEach((property) => {
        formSchema.properties[property.key] = property;
        const newProperty = formSchema.properties[property.key];
        delete newProperty.$id;
        delete newProperty.key;
        newProperty.errorMessage = {};
      });

      // process validation messages
      get(formValidationRules, 'validationMessages', []).forEach((validationMessage) => {
        const { key } = validationMessage;

        get(validationMessage, 'messages', []).forEach((message) => {
          if (formSchema.properties.hasOwnProperty(key)) {
            const errorType = mapErrorCodeToString[message.key];

            if (errorType === 'required') {
              // special handling for 'required' error messages
              formSchema.errorMessage.required[key] = message.message;
            } else if (errorType !== undefined) {
              formSchema.properties[key].errorMessage[errorType] = message.message;
            }
          }
        });
      });

      return formSchema;
    },

    getFormValidationRules(id) {
      const { shopCountry } = getConfiguration('shopCountry');

      return formsApi.getFormValidationRules(id, shopCountry).catch((err) => {
        this.$log.error('Could not load form validation config:', err);
      });
    },

    updateFormData(data) {
      this.$log.debug('RfqContact::updateFormData()', data);

      // reset data if the email has changed
      if (data.email !== this.email) {
        this.userExists = false;
        this.preconfiguredUserCreated = false;
      }

      this.formData = data;
      // remember email to be able to figure out when it changes
      this.email = data.email;

      let formRedrawIsNecessary = false;

      const isAllDataGiven = !this.preconfiguredUserCreated &&
        this.formIsValid &&
        !this.$isAuthenticated() &&
        !this.isAnonymous;
      // create pre-configured user if all data is given
      if (isAllDataGiven) {
        this.createPreconfiguredUser();
      }

      if (data.contactByPhone !== this.contactByPhone) {
        if (data.contactByPhone) {
          this.SET_RFQ_CONTACT_BY_PHONE(true);

          // show phone field
          const phoneFieldAlreadyAdded = this.uiSchema.some(field => field.key === 'phone');

          if (!phoneFieldAlreadyAdded) {
            this.addPhoneField();
            formRedrawIsNecessary = true;
          }
        } else {
          this.SET_RFQ_CONTACT_BY_PHONE(false);

          // hide phone field
          const hasPhoneField = this.uiSchema.some(field => field.key === 'phone');

          if (hasPhoneField) {
            this.removePhoneField();
            formRedrawIsNecessary = true;
          }
        }
      }

      if (data.phone && this.formIsValid && this.preconfiguredUserCreated) {
        // if the input of phone number is happened AFTER preconfigured CIAM user is created,
        // there is no way to persist the updated user data in BE, however it is needed when
        // a quote is submitted, therefore we need to persist it in FE
        this.PATCH_PRECONFIGURED_CIAM_USER({ phone: data.phone });
      }

      if (formRedrawIsNecessary) {
        // let the checkbox animation run before redrawing the form
        setTimeout(() => {
          this.redrawForm();
        }, 500);
      }
    },

    nextStep() {
      this.$log.debug('RfqContact::next()');
      // set contact data in store
      this.SET_CONTACT_DATA(this.formData);
      this.$customEmit('next-step');
    }
  }
};
</script>
<style lang="scss">
.dcp-rfq-container {
  .wb2-sel-checkbox-label {
    margin-bottom: 0;
    height: auto;

    &::before {
      height: 24px;
    }
  }
}
</style>
