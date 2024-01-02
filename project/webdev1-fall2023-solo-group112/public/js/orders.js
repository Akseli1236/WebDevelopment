
(async () => {
    const productsContainer = document.getElementById('products-container');
    const productTemplate = document.getElementById('product-template');
    const detailsTemplate = document.querySelector('#detail-template');
    const detailContainer = document.querySelector('#order-details');
    const response = await getJSON('/api/orders');

    /**
     * Event handler to reset order details
     * 
     * @param {any} event Event of the button press
     */
    const reset = event => {
        event.preventDefault();
        removeElement('order-details', 'show-detail-template');
    };
    

    /**
     * Shows the details of single order
     * @param {any} id Id of order
     * @param {any} name Name of ordered item
     * @param {any} price Price of ordere item
     * @param {any} description Descrition of ordered item
     * @param {any} amount Amount of ordered items
     * @param {any} totalPrice Total price of the order
     */
    const showDetails = (id, name, price, description, amount, totalPrice) => {
        removeElement('order-details', 'show-detail-template');

        const details = detailsTemplate.content.cloneNode(true);
        
        details.querySelector('h2').textContent = `Details of order ${name}`;
        
        details.getElementById('id-text').innerText = id;
        details.getElementById('id-name').innerText = name;
        details.getElementById('id-price').innerText = price;
        details.getElementById('id-description').innerText = description;
        details.getElementById('id-quantity').innerText = amount;
        details.getElementById('id-total-price').innerText = totalPrice;
        
        detailContainer.append(details);
        detailContainer.querySelector('form').addEventListener('submit', reset);

        // Use a callback function to add the event listener

    };
    response.forEach(order => {
        const clonedProduct = productTemplate.content.cloneNode(true);
        clonedProduct.querySelector('.product-name').id = `name-${order._id}`;
        clonedProduct.querySelector('.product-description').id = `description-${order._id}`;
        clonedProduct.querySelector('.product-price').id = `price-${order._id}`;
        clonedProduct.querySelector('.product-quantity').id = `quantity-${order._id}`;
        clonedProduct.querySelector('.total-price').id = `total-price-${order._id}`;

        clonedProduct.getElementById(`name-${order._id}`).textContent = `${order.items[0].product.name}`;
        clonedProduct.getElementById(`description-${order._id}`).textContent = `${order.items[0].product.description}`;
        clonedProduct.getElementById(`price-${order._id}`).textContent = `Price: ${order.items[0].product.price} EUR`;
        clonedProduct.getElementById(`quantity-${order._id}`).textContent = `Amount: ${order.items[0].quantity}`;
        const price = order.items[0].product.price;
        const quantity = order.items[0].quantity;
        const totalPrice = price * quantity;

        clonedProduct.getElementById(`total-price-${order._id}`).textContent = `Total price: ${totalPrice} EUR`;
        clonedProduct.querySelectorAll('[class]').forEach(elem => {

            if (elem.classList.contains('order-details')) {
                elem.id = `order-details-${order._id}`;
                return elem.addEventListener('click', () => showDetails(order._id, order.items[0].product.name, order.items[0].product.price, order.items[0].product.description, order.items[0].quantity, totalPrice));
            }
            const prop = elem.className.split('-')[1];
            if (!order[prop]) return;

            elem.id = `${prop}-${order._id}`;
            elem.textContent = order[prop];
        });
        productsContainer.appendChild(clonedProduct);
    });
})();