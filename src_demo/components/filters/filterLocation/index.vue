<template>
  <div>
    <h1
      class="dcp-filter-location-search__value-headline"
    >{{ $t('dcp.srp.filters.locationSearch.headline') }}</h1>
    <div class="dcp-filter-location-search__error-message" v-show="errorMessage">
      <div class="dcp-filter-location-search__error-message-text">{{ errorMessage }}</div>
    </div>
    <dynamic-form
      class="dcp-filter-location-search__form"
      :form-data="formData"
      :form-schema="formSchema"
      :is-dark-bg="false"
      :ui-schema="uiSchema"
      @change="formInputChanged"
      @validity-change="updateFormValidity"
    />
    <p class="dcp-filter-location-search__value-text" v-html="filterLabel"></p>
  </div>
</template>

<script>
import DynamicForm from '@dcp-vue/platform-core/src/components/utils/dynamicForm/index.vue'
import { mapState, mapMutations } from 'vuex'
import axios from 'axios'
import get from 'lodash/get'
import merge from 'lodash/merge'

const DLC_API_URL = 'https://api.corpinter.net/dlc/dms/v2'

export const getLocationFilterLabel = (
  { isStyled = false, isLong = false } = {
    isStyled: false,
    isLong: false
  }
) => ({ numberOfDealers, postalCode, country }) => {
  const location =
    postalCode && numberOfDealers
      ? `near ${isStyled ? '<b>' : ''}${postalCode}, ${country}${
          isStyled ? '</b>' : ''
        }`
      : `in ${isStyled ? '<b>' : ''}${country}${isStyled ? '</b>' : ''}`

  const availabilityString = `${
    isLong ? `Available ${numberOfDealers > 1 ? 'across' : 'at'} ` : ''
  }`
  return `
    ${availabilityString}${isStyled ? '<b>' : ''}${numberOfDealers}${
    isStyled ? '</b>' : ''
  }
    agent${numberOfDealers > 1 ? 's' : ''}
    ${location}
  `
}

export default {
  name: 'FilterLocation',
  components: {
    DynamicForm
  },

  computed: {
    ...mapState('overseasConfig', ['shopCountry', 'filterLocation']),
    ...mapState({
      dealerIDs: state =>
        (
          state.search.filters.find(({ code }) => code === 'dealer') || {
            value: []
          }
        ).value,
      dealerOptions: state =>
        (
          state.search.filters.find(({ code }) => code === 'dealer') || {
            options: []
          }
        ).options.map(({ value }) => value),
      postalCode: state => state.search.locationData.postalCode,
      distanceFrom: state => state.search.locationData.distanceFrom
    }),
    locationData() {
      return {
        postalCode: this.postalCode,
        distanceFrom: this.distanceFrom
      }
    }
  },

  data() {
    return {
      filterValue: [],
      filterLabel: '',
      errorMessage: '',
      isValid: false,
      formData: {},
      formSchema: {
        type: 'object',
        properties: {
          postalCode: {
            type: 'string',
            errorMessage: {
              pattern: this.$i18n.t(
                'dcp.srp.filters.locationSearch.postalCode.error'
              )
            }
          },
          distanceFrom: {
            type: 'string'
          }
        },
        required: ['postalCode', 'distanceFrom'],
        errorMessage: {
          required: {
            postalCode: this.$i18n.t('dcp.form.error.required.postalCode')
          }
        }
      },
      uiSchema: [
        {
          children: [
            {
              component: 'sf-default-input',
              type: 'string',
              key: 'postalCode',
              label: 'Postal code',
              testId: 'postalCode'
            },
            {
              component: 'sf-select',
              disabled: false,
              key: 'distanceFrom',
              label: 'Distance from ',
              options: [
                {
                  label: '25 Km',
                  value: '25'
                },
                {
                  label: '50 Km',
                  value: '50'
                },
                {
                  label: '100 Km',
                  value: '100'
                }
              ]
            }
          ],
          key: '',
          class: 'dcp-field-set-street-house-number',
          component: 'sf-field-set'
        }
      ]
    }
  },

  created() {
    this.$log.debug('FilterLocation::created()', this.formData)

    const formSchema = get(this.filterLocation, 'formSchema', {})
    this.formSchema = merge(this.formSchema, formSchema)
  },

  methods: {
    ...mapMutations([
      'SET_LOCATION_SEARCH_POSTAL_CODE',
      'SET_LOCATION_SEARCH_DISTANCE_FROM'
    ]),

    formInputChanged(data) {
      this.$log.debug('FilterLocation::formInputChanged()')

      const { postalCode, distanceFrom } = data
      if (this.isValid) {
        this.SET_LOCATION_SEARCH_POSTAL_CODE(postalCode)
        this.SET_LOCATION_SEARCH_DISTANCE_FROM(distanceFrom)
      }
    },

    updateFormValidity(validity) {
      this.$log.debug('FilterLocation::updateFormValidity()')
      this.isValid = validity
      this.$emit('validity-change', validity)
    },

    setFilterLabel() {
      const numberOfDealers = this.dealerIDs.length || this.dealerOptions.length
      const { postalCode } = this
      const country = this.$i18n.t('dcp.country.name')
      this.filterLabel = this.$i18n.t(
        'dcp.srp.filters.locationSearch.label.long.styled',
        {
          at:
            postalCode && numberOfDealers
              ? this.$i18n.t('dcp.language.across')
              : this.$i18n.t('dcp.language.at'),
          numberOfDealers,
          plural: this.$i18n.t('dcp.language.plural'),
          near:
            postalCode && numberOfDealers
              ? this.$i18n.t('dcp.language.near')
              : this.$i18n.t('dcp.language.in'),
          location:
            postalCode && numberOfDealers
              ? `${postalCode}, ${country}`
              : country
        }
      )
    }
  },

  watch: {
    dealerOptions: {
      handler() {
        if (!this.dealerIDs.length) {
          // Clear postalCode field
          this.SET_LOCATION_SEARCH_POSTAL_CODE('')
        }
      }
    },
    locationData: {
      deep: true,
      immediate: true,
      async handler({ postalCode, distanceFrom }) {
        try {
          this.formData = {
            postalCode,
            distanceFrom
          }

          if (postalCode && distanceFrom && this.isValid) {
            const { shopCountry } = this

            this.$log.debug('FilterLocation::formData() --> valid', {
              shopCountry,
              postalCode,
              distanceFrom
            })

            const searchQuery = `?country=${shopCountry}&location=${postalCode}&distance=${distanceFrom}km`
            const searchUrl = `${DLC_API_URL}/dealers/search${searchQuery}`
            const { data } = await axios.get(searchUrl, {
              headers: {
                'X-APIKey': '1016f21e-d3c5-48dc-a76c-076c7c53296e'
              }
            })
            const { results } = data
            const filterValue = (results || [])
              .map(({ baseInfo }) => baseInfo.externalId)
              .filter(dealerId => this.dealerOptions.includes(dealerId))
            this.filterValue = filterValue

            if (!filterValue.length) {
              // No matching dealers availble in this location
              this.errorMessage = `No dealers with cars available found near ${postalCode}, ${this.$i18n.t(
                'dcp.country.name'
              )}. Searching across ${this.$i18n.t('dcp.country.name')}.`
            } else {
              // Remove any error message
              this.errorMessage = ''
            }

            this.$log.debug('FilterLocation::formData() --> filterValue', {
              filterValue
            })
            this.$emit('change', {
              filterCode: 'dealer',
              filterValue
            })
          }
        } catch (error) {
          this.$log.error('FilterLocation::formData() --> error', error)
        } finally {
          this.setFilterLabel()
        }
      }
    }
  }
}
</script>
<style src="@dcp-vue/platform-core/src/components/payment/addressInput/generic/addressInput.scss" lang="scss"></style>
<style lang="scss">
.dcp-filter-location-search {
  text-align: left;

  &__headline {
    @include wb2-spacing('padding-bottom', 'xs');
    @include wb2_type_hl-m;
  }

  &__error-message-text {
    @include wb2-spacing('padding', 'xs');
    @include wb2-spacing('margin-bottom', 'xs');

    background-color: $wb2_color_error_bg;
    color: $wb2_color_errorred;
  }

  &__additional-info {
    @include wb2_type_hint;
    @include wb2-spacing('margin-right', 'xs');
  }

  &__value-headline {
    @include wb2_type_hl-m;
    @include wb2-spacing('margin-bottom', 's');

    -webkit-font-smoothing: antialiased;
    color: $wb2_color_grey;
  }

  &__value-text {
    @include wb2_type_copy;
    @include wb2-spacing('margin-bottom', 'xs');

    color: $wb2_color_grey;
    -webkit-font-smoothing: antialiased;

    & b {
      @include wb2_type_copy_strong;
    }
  }
}

.wb2-sel-radio-button {
  .wb2-sel-radio-button__item:nth-child(2) {
    @include wb2-spacing('margin-right', 'xs');
    @include wb2-spacing('margin-bottom', 'xxs');

    display: inline-flex;
  }

  .wb2-sel-radio-button__item:nth-child(3) {
    display: inline-flex;
  }

  @media (max-width: map-get($wb2-mq-scale, 'mq4')) {
    .wb2-sel-radio-button__item:nth-child(2) {
      display: flex;
    }

    .wb2-sel-radio-button__item:nth-child(3) {
      display: flex;
    }
  }
}

.wb2-form {
  @include wb2-spacing('margin-bottom', 'xxs');
}

.dcp-field-set-street-house-number {
  @media (min-width: map-get($wb2-mq-scale, 'mq4')) {
    .dcp-sf-fieldset__item-1 {
      @include wb2-spacing('margin-right', 'xxs');

      flex: 1 0 auto;
      width: auto;
    }

    .dcp-sf-fieldset__item-2 {
      flex: 1 0 auto;
      width: auto;
    }

    &:not(:last-child) {
      @include wb2-spacing('margin-bottom', 'xxs');
    }
  }
}
</style>
