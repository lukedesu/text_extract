// The window.dcp.baseUrl is set in the first script tag of the index.html file.
// It is set by the vue.config.js during the build process and is either set to
// '/' on local environments or it is set to the placeholder string //DCP_BASE_URL//
// when it is build with the purpose of running it in a Docker container. The
// placeholder is then replaced at container start up with the sub-directory in
// which the app is running.

if (!window.dcp || !window.dcp.baseUrl) {
  throw Error('The baseUrl must be configured in window.dcp.baseUrl');
}

// eslint-disable-next-line
__webpack_public_path__ = window.dcp.baseUrl;
