import CoreProductsAPI from '@dcp-vue/platform-core/src/utils/api/products';
import FilterModel from '@dcp-vue/platform-core/src/models/filter.model';
import ProductModel from '@dcp-vue/platform-core/src/models/product.model';
import httpService from '../httpService';

export default {
  ...CoreProductsAPI,

  /**
   * Returns a list of products and additional data such as: available filters,
   * available sorting and pagination options.
   * @returns {Promise}
   */
  searchProducts(selectedSort = '', selectedAssortment = '', filters = [], currentPage = 0) {
    let query = `:${selectedSort}:${selectedAssortment}`;

    const sliderAndDealerFilters = filters.reduce((acc, { code, max, value }) => {
      // Slider filter always have a "max" property
      if (max) {
        return {
          ...acc,
          [code]: {
            max, // max is invariant
            value
          }
        };
      }

      // Dealer filter value list
      if (code === 'dealer') {
        return {
          ...acc,
          [code]: {
            value
          }
        };
      }
      return acc;
    }, {});

    filters.forEach((filter) => {
      if (filter.isSelected()) {
        query += filter.getQueryValue();
      }
    });

    const params = {
      query,
      currentPage,
      pageSize: 12,
      fields: 'FULL'
    };

    return httpService.get('products/search', params)
      .then((response) => {
        // Match search stat values with corresponding filters and add corresponding attributes
        if (response.searchStats) {
          response.searchStats.forEach((stats) => {
            const matchedFilterIndex = response.facets.findIndex(filter => filter.code === stats.name);

            if (matchedFilterIndex !== -1) {
              response.facets[matchedFilterIndex] = Object.assign(response.facets[matchedFilterIndex], stats);
            }
          });
        }

        // Parse attributes into models
        response.products = response.products.map(product => new ProductModel(product));
        const facetFilters = response.facets
          .map(filter => new FilterModel({
            ...filter,
            ...(
              // Map slider filters' max and value props
              sliderAndDealerFilters[filter.code] ? sliderAndDealerFilters[filter.code] : {}
            )
          }));

        // [OTOS-1203] Merge queried filters with returned facets
        // to prevent UI filters from disappearing
        const mergedFilters = filters.reduce((acc, filter) => {
          const filterIndex = acc.findIndex(({ code }) => code === filter.code);

          if (filterIndex > -1) {
            // Replace the filter with the returned facet
            acc[filterIndex] = new FilterModel({
              ...filter,
              ...(
                // Map slider filters' max and value props
                sliderAndDealerFilters[filter.code] ? sliderAndDealerFilters[filter.code] : {}
              )
            });

            return [...acc];
          }

          // Append the filter during the initial query
          return [...acc, filter];
        }, facetFilters);

        // Order filters by priority since backend as inconsistent ordering
        response.filters = mergedFilters.sort((a, b) => {
          let result = 0;

          if (a.priority < b.priority) {
            result = 1;
          }
          if (a.priority > b.priority) {
            result = -1;
          }

          return result;
        });

        return response;
      });
  },
};
