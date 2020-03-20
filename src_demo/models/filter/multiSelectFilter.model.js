import CoreMultiSelectFilterModel from '@dcp-vue/platform-core/src/models/filter/multiSelectFilter.model';

export default class MultiSelectFilterModel extends CoreMultiSelectFilterModel {
  constructor(data) {
    super(data, true);

    // Only process data if it's not a model
    if (!data._isModel && this.code === 'dealer') {
      this.value = data.value && data.value.length
        ? data.value
        : [];
    }
  }
}
