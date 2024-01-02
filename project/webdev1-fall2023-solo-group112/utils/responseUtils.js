/**
 * Gives basicAuthChallenge if wrong or missing authentication
 * 
 * @param {any} response The HTTP response object.
 */
const basicAuthChallenge = response => {
    // TODO: 8.5 Send proper basic authentication challenge headers.
    // See:
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#the_general_http_authentication_framework
    // The first step of the challenge and response flow  as described on the webpage is done here.
    response.setHeader('WWW-Authenticate', 'Basic');
    unauthorized(response);
    //console.log(response);
};

/**
 * Sends json to server
 * 
 * @param {any} response The HTTP response object.
 * @param {any} payload payload that is sent to server
 * @param {any} code Code is for success
 * @returns {void} ends respone
 */
const sendJson = (response, payload, code = 200) => {
    response.writeHead(code, { 'Content-Type': 'application/json' });
    return response.end(JSON.stringify(payload));
};

/**
 * creates a resource
 * 
 * @param {any} response The HTTP response object.
 * @param {any} payload data to send to the server
 * @returns {void} ends respone
 */ 
const createdResource = (response, payload) => {
    return sendJson(response, payload, 201);
};
/**
 * No content response
 * 
 * @param {any} response The HTTP response object.
 * @returns {void} ends respone
 */
const noContent = response => {
    response.statusCode = 204;
    return response.end();
};
/**
 * Bad request reponse
 * 
 * @param {any} response The HTTP response object.
 * @param {any} errorMsg Error message that has been received
 * @returns {void} ends respone
 */
const badRequest = (response, errorMsg) => {
    if (errorMsg) return sendJson(response, { error: errorMsg }, 400);

    response.statusCode = 400;
    return response.end();
};
/**
 * User has no permission
 * 
 * @param {any} response The HTTP response object.
 * @returns {void} ends respone
 */
const unauthorized = response => {
    response.statusCode = 401;
    return response.end();
};
/**
 * User has no permission
 * 
 * @param {any} response The HTTP response object.
 * @returns {void} ends respone
 */
const forbidden = response => {
    response.statusCode = 403;
    return response.end();
};
/**
 * Location not found
 * 
 * @param {any} response The HTTP response object.
 * @returns {void} ends respone
 */
const notFound = response => {
    response.statusCode = 404;
    return response.end();
};
/**
 * Wrong method
 * 
 * @param {any} response The HTTP response object.
 * @returns {void} ends respone
 */
const methodNotAllowed = response => {
    response.statusCode = 405;
    return response.end();
};
/**
 * Not a json
 * 
 * @param {any} response The HTTP response object.
 * @returns {void} ends respone
 */
const contentTypeNotAcceptable = response => {
    response.statusCode = 406;
    return response.end();
};
/**
 * Internal server error
 * 
 * @param {any} response The HTTP response object.
 * @returns {void} ends respone
 */
const internalServerError = response => {
    response.statusCode = 500;
    return response.end();
};
/**
 * Redirects to another page
 * 
 * @param {any} response The HTTP response object.
 * @param {any} page page that we want to redirect
 */
const redirectToPage = (response, page) => {
    response.writeHead(302, { Location: page });
    response.end();
};

module.exports = {
    sendJson,
    createdResource,
    noContent,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    methodNotAllowed,
    contentTypeNotAcceptable,
    internalServerError,
    basicAuthChallenge,
    redirectToPage
};
