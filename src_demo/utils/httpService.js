import axios from 'axios';
import qs from 'qs';
import { getConfiguration } from '@dcp-vue/platform-core/src/utils/configuration';

const activeRequests = {};

function generateRequestId(options) {
  return `${JSON.stringify(options)}`;
}

function makeRequest(options) {
  // Generate unique id for each request based on its properties
  const requestId = generateRequestId(options);

  // Only make request, if there is not one already happening with the same parameters
  if (!activeRequests[requestId]) {
    const request = axios(options)
      .then((response) => {
        // Remove resolved request from active requests map
        delete activeRequests[requestId];

        // Return only the data requested
        return response.data;
      });

    // Add request to list of ongoing requests
    activeRequests[requestId] = request;
  }

  return activeRequests[requestId];
}

function processRequest(method, url, params = {}, data) {
  const { apiBaseUrl, lang, siteId } = getConfiguration('apiBaseUrl', 'lang', 'siteId');

  // Add lang to queries
  params.lang = lang;

  // [OTOS-928]: Encode all params to prevent decoding issues with range facet queries
  const queryParams = qs.stringify(params);

  const options = {
    method,
    url: `${apiBaseUrl}/v2/${siteId}/${url}?${queryParams}`,
    data
  };

  return makeRequest(options);
}

export default {
  get: (url, params, data) => processRequest('GET', url, params, data),
  post: (url, params, data) => processRequest('POST', url, params, data),
  put: (url, params, data) => processRequest('PUT', url, params, data),
  patch: (url, params, data) => processRequest('PATCH', url, params, data),
  delete: (url, params, data) => processRequest('DELETE', url, params, data),

  /**
   * Custom request allows you to call the httpService's instance of axios directly, bypassing any default values
   * or settings, but still benefiting from repeated call prevention and automatic response parsing.
   *
   * The 'options' parameter must have the same structure expected if you would call 'axios(options)'
   * you can find documentation for it in the following link: https://github.com/axios/axios#request-config
   */
  customRequest: makeRequest
};
