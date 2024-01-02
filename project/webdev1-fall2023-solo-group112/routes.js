const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson} = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');
const { getAllProducts, viewProduct, updateProduct, deleteProduct } = require('./controllers/products');
const { getAllUsers, deleteUser, updateUser, viewUser, registerUser } = require('./controllers/users');
const Product = require('./models/product');
const Order = require('./models/order');



/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
    '/api/register': ['POST'],
    '/api/users': ['GET'],
    '/api/products': ['GET', 'POST'],
    '/api/orders': ['GET', 'POST']
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response The HTTP response object.
 */
const sendOptions = (filePath, response) => {
    if (filePath in allowedMethods) {
        response.writeHead(204, {
            'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
            'Access-Control-Allow-Headers': 'Content-Type,Accept',
            'Access-Control-Max-Age': '86400',
            'Access-Control-Expose-Headers': 'Content-Type,Accept'
        });
        return response.end();
    }

    return responseUtils.notFound(response);
};


/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix Where we look for the ID
 * @returns {boolean} True if last part was ID component
 */
const matchIdRoute = (url, prefix) => {
    const idPattern = '[0-9a-z]{8,24}';
    const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
    return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} True if url match
 */
const matchUserId = url => {
    return matchIdRoute(url, 'users');
};
/**
 * Does the URL match /api/products/{id}
 * 
 * @param {any} url given url
 * @returns {boolean} True if url match
 */
const matchUserIdprods = url => {
    return matchIdRoute(url, 'products');
};
/**
 * 
 * Does the URL match /api/orders/{id}
 * 
 * @param {any} url given url
 * @returns {boolean} True if url match
 */
const matchUserIdOrder = url => {
    return matchIdRoute(url, 'orders');
};

/**
 * Checks user authentications.
 * 
 * @param {any} request The HTTP request object.
 * @param {any} response The HTTP response object.
 * @returns True or authChallenge
 */
const authentication = (request, response) => {
    const auth = request.headers['authorization'];
    //console.log(result);
    if (!auth) {
        //contentTypeNotAcceptable(response);
        //responseUtils.unauthorized(response);
        return responseUtils.basicAuthChallenge(response);
    }
    return true;

};
/**
 * Finds user from request
 * 
 * @param {any} request The HTTP request object.
 * @param {any} response The HTTP response object.
 * @returns user or AuthChallenge
 */
const findUser = async (request, response) => {
    const user = await getCurrentUser(request);

    if (!user) {
        return responseUtils.basicAuthChallenge(response);
    }
    return user;

};
/**
 * Handles the requests.
 * 
 * @param {any} request The HTTP request object.
 * @param {any} response The HTTP response object.
 * @returns different responses depending on the situatuon
 */
const handleRequest = async (request, response) => {
    
    const { url, method, headers } = request;
    const filePath = new URL(url, `http://${headers.host}`).pathname;
    // Default to 404 Not Found if unknown url

    if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
        const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
        return renderPublic(fileName, response);
    }


    if (matchUserId(filePath)) {
        const match = filePath.match(/\/api\/users\/(\w+)/);
        const userId = match[1];
        if (authentication(request, response)) {
            if (!acceptsJson(request)) {
                return responseUtils.contentTypeNotAcceptable(response);
            }

            //const auther = getUser(splitStr[0], splitStr[1]);
            const user = await findUser(request, response);

            if (user.role === 'customer') {
                return responseUtils.forbidden(response);
            }

            if (method === 'GET') {
                await viewUser(response, userId, user);
            }

            if (method === 'PUT') {
                const req = await parseBodyJson(request);
                await updateUser(response, userId, user, req);
                //const existingUser = User.findById(userId).exec(); 
            }
            if (method === 'DELETE') {
                await deleteUser(response, userId, user);
            }

            if (method === 'OPTIONS') {
                return sendOptions(filePath, response);
            }
        }
        
    }

    if (matchUserIdprods(filePath)) {
        if (authentication(request, response)) {
            const user = await findUser(request, response);
            if (!acceptsJson(request)) {
                return responseUtils.contentTypeNotAcceptable(response);
            }
            const match = filePath.match(/\/api\/products\/(\w+)/);
            const productId = match[1];
            if (method === 'GET') {
                await viewProduct(response, productId, user);
            }

            if (method === 'PUT') {
                
                const user = await findUser(request, response);
                const req = await parseBodyJson(request);
                console.log(req);
                await updateProduct(response, productId, user, req);
                
            }
            if (method === 'DELETE') {
                await deleteProduct(response, productId, user);
                
            }
        }
        
        
    }

    if (matchUserIdOrder(filePath)) {
        if (authentication(request, response)) {
            const user = await findUser(request, response);
            if (!acceptsJson(request)) {
                return responseUtils.contentTypeNotAcceptable(response);
            }
            const match = filePath.match(/\/api\/orders\/(\w+)/);
            const orderId = match[1];
            if (user.role === 'admin' || user.role === 'customer') {
                const ord = await Order.findOne({ _id: orderId });
                if (!ord || (user.role === 'customer' && user.id !== ord.customerId)) {
                    return responseUtils.notFound(response);
                }
                else {
                    return responseUtils.sendJson(response, ord);
                }
                
            }
        }
    }
    
    // Default to 404 Not Found if unknown url
    if (!(filePath in allowedMethods)) return responseUtils.notFound(response);
    // See: http://restcookbook.com/HTTP%20Methods/options/
    if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);

    // Check for allowable methods
    if (!allowedMethods[filePath].includes(method.toUpperCase())) {
        return responseUtils.methodNotAllowed(response);
    }

    // Require a correct accept header (require 'application/json' or '*/*')
    if (!acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
    }



    // Require a correct accept header (require 'application/json' or '*/*')
    

    // GET all users
    if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
        // TODO: 8.5 Add authentication (only allowed to users with role "admin")
        if (authentication(request, response)) {
            const user = await findUser(request, response);
            if (user.role === 'customer') {
                return responseUtils.forbidden(response);
            }
            await getAllUsers(response);
        }
        

    }
    if (filePath === '/api/orders') {
        if (authentication(request, response)) {
            if (method === 'GET') {
                const user = await findUser(request, response);
                if (!acceptsJson(request)) {
                    return responseUtils.contentTypeNotAcceptable(response);
                }
                if (user.role === 'admin') {
                    const ord = await Order.find();
                    return responseUtils.sendJson(response, ord);
                } else if (user.role === 'customer') {
                    const ord = await Order.find({ customerId: user.id });
                    return responseUtils.sendJson(response, ord);
                }
            } else if (method === 'POST') {
                
                if (!isJson(request)) {
                    return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
                }
                
                const user = await findUser(request, response);
                if (!acceptsJson(request)) {
                    return responseUtils.contentTypeNotAcceptable(response);
                }
                if (user.role === 'admin') {
                    return responseUtils.forbidden(response);
                }
                
                const req = await parseBodyJson(request);
                if (req.items === undefined || req.items.length === 0) {
                    return responseUtils.badRequest(response, 'BAD');
                }

                if (!req.items[0].quantity || !req.items[0].product || !req.items[0].product._id || !req.items[0].product.price || !req.items[0].product.name) {
                    return responseUtils.badRequest(response, 'BAD');
                }

                const newOrder = new Order({
                    customerId: user.id, // Replace with the actual customer ID
                    items: [
                        {
                            product: {
                                _id: req.items[0].product._id, // Replace with the actual product ID
                                name: req.items[0].product.name,
                                price: req.items[0].product.price,
                                description: req.items[0].product.description,
                            },
                            quantity: req.items[0].quantity,
                        },
                    ],
                });

                await newOrder.save();
                return responseUtils.createdResource(response, newOrder);
            }
            
        }
    }
    if (filePath === '/api/products') {
        //const promise = await getCurrentUser(request);
        if (authentication(request, response)) {

            if (method === 'GET') {
                const user = await findUser(request, response);

                await getAllProducts(response);
            }
            if (method === 'POST') {
                if (!isJson(request)) {
                    return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
                }
                const user = await findUser(request, response);
                if (user.role === 'customer') {
                    return responseUtils.forbidden(response);
                }
                const req = await parseBodyJson(request);
                if (!req.name || !req.price) {
                    return responseUtils.badRequest(response, "Missing");
                }
                const newProduct = new Product({
                    name: req.name,
                    price: req.price,
                    image: req.image,
                    description: req.description, // Set the user's role
                });
                await newProduct.save();
                return responseUtils.createdResource(response, newProduct);
            }
            
        }


    }
    // register new user
    if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
        // Fail if not a JSON request, don't allow non-JSON Content-Type
        if (!isJson(request)) {
            return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
        }
        const promise = await parseBodyJson(request);
        await registerUser(response, promise);

    }
};

module.exports = { handleRequest };