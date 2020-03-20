// import httpService from '../httpService';
import { getConfiguration } from '@dcp-vue/platform-core/src/utils/configuration';
import httpService from '../httpService';

export default {
  /**
   * Patches quote (OTOS-621 due to contact me form need additional header x-session-quote-type: CONTACT)
   *
   * @param {String} quoteId - quote id
   * @param {Object} data - quote data
   * @param {Object} requestParams - all additional request params including headers etc.
   * @returns {Promise}
   */
  patchQuote(quoteId, data, requestParams) {
    const { apiBaseUrl, siteId } = getConfiguration('apiBaseUrl', 'siteId');

    const { headers } = requestParams || { headers: {} };

    const params = {
      fields: 'RFQ',
      patchMethod: true
    };

    return httpService.customRequest({
      method: 'patch',
      url: `${apiBaseUrl}/v2/${siteId}/open/quotes/${quoteId}`,
      params,
      data,
      headers
    });
  }
};
