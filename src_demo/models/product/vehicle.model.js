import get from 'lodash/get';
import { getConfiguration } from '@dcp-vue/platform-core/src/utils/configuration';

import CoreVehicleModel from '@dcp-vue/platform-core/src/models/product/vehicle.model';

export default class Vehicle extends CoreVehicleModel {
  constructor(data) {
    super(data, true);

    // Only process data if it's not a model
    if (!data._isModel) {
      // process emico data
      this.emicoData = data.localEmissionAndConsumptionData;
      if (typeof this.emicoData === 'string') {
        this.emicoData = JSON.parse(this.emicoData);
      }

      const lang = getConfiguration('lang');
      this.emicoFootnote = get(this.emicoData, `uidata.footnotes.${lang}`, '');
      this.emicoData = get(this.emicoData, 'uidata.attributes', []).map(item => ({
        displayValue: item.displayValue,
        label: (item.label && item.label[lang]) ? item.label[lang] : '',
        footnote: {
          referenceNumber: 1
        }
      }));

      // process point of service data
      // for now, we only use the first point of service entry, if provided
      const pointOfService = get(data, 'pointOfServices[0]', {});
      this.pointOfServiceDisplayName = pointOfService.displayName;
      this.pointOfServiceFormattedAddress = get(pointOfService, 'address.formattedAddress', '');

      // process monthly rate
      // on the SRP, this object is provided in the monthlyRate property
      // on the PDP, it's an element of the displayPrices array
      this.monthlyRate = data.monthlyRate || get(data, 'displayPrices', []).find(entry => entry.priceType === 'FINANCING');

      // parse priceDescription (monthly rate breakdown) JSON, if provided
      const priceDescriptionString = get(this, 'monthlyRate.priceDescription', '');
      if (priceDescriptionString) {
        this.monthlyRate.priceDescription = JSON.parse(priceDescriptionString);
      }

      // add disclaimer indices to monthly rate breakdown items
      let disclaimerCount = 0;
      get(this, 'monthlyRate.priceDescription.items', []).forEach((item) => {
        if (item.disclaimer) {
          item.disclaimerIndex = disclaimerCount++;
        }
      });

      // process stock
      this.stock = get(data, 'stock', undefined);

      // adjust product summary
      this.summary = '';
      if (this.powerInKw) {
        // different from the core: only show power in kw, not in cv
        this.summary += `${this.powerInKw} kW,`;
      }
      if (this.fuelType) {
        this.summary += ` ${this.fuelType},`;
      }
      if (this.transmission) {
        this.summary += ` ${this.transmission}`;
      }
      if (this.summary.substr(-1, 1) === ',') {
        this.summary = this.summary.substr(0, this.summary.length - 1);
      }
    }
  }
}
