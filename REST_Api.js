const request = require( "request-promise" );

const fetch = ( url, method, options ) => {
  options = options || {};

  var st = {
    method: method,
    uri: url,
    json: true,
    body: options.body,
    form: options.form,
    headers: options.headers
  };
  return request( st );
};

module.exports = {
  get: ( url, options ) => {
    return fetch( url, "GET", options );
  },
  post: ( url, options ) => {
    return fetch( url, "POST", options );
  },
  put: ( url, options ) => {
    return fetch( url, "PUT", options );
  },
  delete: ( url, options ) => {
    return fetch( url, "DELETE", options );
  }
};