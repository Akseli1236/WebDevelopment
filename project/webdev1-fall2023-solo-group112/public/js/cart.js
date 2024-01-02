
/**
 * Adds product to cart
 * 
 * @param {any} productId ProductId
 */

const addToCart = productId => {
    addProductToCart(productId);
    updateProductAmount(productId);
};

/**
 * Decreases the product amount in cart
 * 
 * @param {any} productId ProductId
 */

const decreaseCount = productId => {
    console.log(productId);
    const count = decreaseProductCount(productId);
    if (count === 0) {
        const elementToRemove = document.getElementById(`${productId}`);

        if (elementToRemove) {
            elementToRemove.remove();
        } else {
            console.warn('Element not found.');
        }
    } else {
        updateProductAmount(productId);
    }

};
/**
 * Updates the product amount for user to see
 * 
 * @param {any} productId ProductId
 */

const updateProductAmount = productId => {
    const amount = getProductCountFromCart(productId);
    console.log(amount);
    document.getElementById(`amount-${productId}`).textContent = `${amount}x`;


};
/**
 * Places order
 */

const placeOrder = async () => {
    
    const products = getAllProductsFromCart();
    let items = [];
    let product;

        // Order placed successfully, handle UI changes
    products.forEach(singleProduct => {
        
        const elementToRemove = document.getElementById(`${singleProduct.name}`);
        //console.log(singleProduct.name);
        const id = singleProduct.name;
        const name = elementToRemove.querySelector('.product-name').textContent;
        const price = elementToRemove.querySelector('.product-price').textContent;
        const description = elementToRemove.querySelector('.product-description').textContent;
        const quantity = singleProduct.amount;
        product = {
            name: name,
            price: price,
            description: description,
            _id: id
        };
        items = [{ product, quantity: quantity }];
        const response = fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items,
            }),
        });
            if (elementToRemove) {
                elementToRemove.remove();
            } else {
                console.warn('Element not found.');
            }
    });
    createNotification('success', 'notifications-container', true);
    await clearCart();
    
};

document.getElementById('place-order-button').addEventListener('click', () => {
    placeOrder();
});

(async () => {


    const productsContainer = document.getElementById('cart-container');
    const productTemplate = document.getElementById('cart-item-template');
    const response = await getJSON('/api/products');
    
    response.forEach(product => {

        const clonedProduct = productTemplate.content.cloneNode(true);
        clonedProduct.querySelector('.item-row').id = product._id;
        clonedProduct.querySelector('.product-name').id = `name-${product._id}`;
        clonedProduct.querySelector('.product-price').id = `price-${product._id}`;
        clonedProduct.querySelector('.product-amount').id = `amount-${product._id}`;
        clonedProduct.querySelector('.product-description').id = `description-${product._id}`;

        // Assuming the URL contains the initial product coun

        // Update the cloned product with the initial values
        clonedProduct.querySelector(`#name-${product._id}`).textContent = product.name;
        clonedProduct.querySelector(`#price-${product._id}`).textContent = product.price;
        clonedProduct.querySelector(`#amount-${product._id}`).textContent = `${getProductCountFromCart(product._id)}x`;
        clonedProduct.querySelector(`#description-${product._id}`).textContent = product.description;

        const buttons = clonedProduct.querySelectorAll('button');
        buttons.forEach(button => {
            const buttonText = button.textContent.trim();
            if (buttonText === '+') {
                button.id = `plus-${product._id}`;
            } else if (buttonText === '-') {
                button.id = `minus-${product._id}`;
            }
            button.addEventListener('click', () => {
                if (button.id === `plus-${product._id}`) {
                    console.log("Adding to cart");
                    addToCart(product._id);
                } else if (button.id === `minus-${product._id}`) {
                    console.log("Decreasing count");
                    decreaseCount(product._id);

                }
            });
        });

        // Append the cloned product to the products container
        if (getProductCountFromCart(product._id)) {
            productsContainer.appendChild(clonedProduct);
        }
        
    });

})();