import sortBy from 'lodash/sortBy';
import CoreSliderFilterModel from '@dcp-vue/platform-core/src/models/filter/sliderFilter.model';
import { getSliderFilterUnit } from '../../utils/utils-srp';

export default class SliderFilterModel extends CoreSliderFilterModel {
  constructor(data) {
    super(data, true);

    // Only process data if it's not a model
    if (!data._isModel) {
      data.values = sortBy(data.values, [({ code }) => Number(code)]);
      this.from = Number(data.values[0].code);
      this.to = Number([...data.values].pop().code);
      this.max = data.max;
      this.min = data.min;
      this.value = [data.value || this.to];
      this.label = `Up to {to} ${getSliderFilterUnit(data.code)}`;
    }
  }
}
