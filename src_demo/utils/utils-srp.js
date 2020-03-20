import { getConfiguration } from '@dcp-vue/platform-core/src/utils/configuration';
import ENUMS from './enums.config';

export const SEARCH_FILTERS = {
  model: {
    code: 'model',
    timeUnit: ''
  },
  bodyType: {
    code: 'bodyType',
    timeUnit: ''
  },
  priceSlider: {
    code: 'priceSlider',
    timeUnit: '(RRP)' // TODO: requires i18n
  },
  monthlyPriceSlider: {
    code: 'monthlyPriceSlider',
    timeUnit: '(monthly)' // TODO: requires i18n
  },
  transmission: {
    code: 'transmission',
    timeUnit: ''
  },
  powerInKwSlider: {
    code: 'powerInKwSlider',
    timeUnit: ''
  },
  fuel_type: {
    code: 'fuel_type',
    timeUnit: ''
  },
  equipment: {
    code: 'equipment',
    timeUnit: ''
  },
  upholstery_text: {
    code: 'upholstery_text',
    timeUnit: ''
  },
  color_text: {
    code: 'color_text',
    timeUnit: ''
  },
  product_category: {
    code: 'product_category',
    timeUnit: ''
  },
  gearBox: {
    code: 'gearBox',
    timeUnit: ''
  }
};

export const getSliderFilterUnit = (key) => {
  if (key === 'priceSlider' || key === 'monthlyPriceSlider') {
    return `${getConfiguration('defaultCurrencySymbol')} ${SEARCH_FILTERS[key].timeUnit}`;
  }

  if (key === 'powerInKwSlider') {
    return 'Kw';
  }

  return undefined;
};

export const getSearchFilters = ({
  code, options, type, min, max
}) => (
  (
    type === ENUMS.FilterTypes.MultiSelect
      // Hide filters with less than two options
      ? options.length > 1
      // Hide sliders without a min value
      : min && min !== max
  ) &&
  !!SEARCH_FILTERS[code]
);
