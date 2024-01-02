
/**
 * Adds product to cart
 * 
 * @param {any} productId ProducId
 * @param {any} productName ProductName
 */
const addToCart = (productId, productName) => {

    addProductToCart(productId);
    console.log(productId);
    createNotification(`Added ${productName} to cart!`, 'notifications-container', true);

};

(async () => {
    const productsContainer = document.getElementById('products-container');
    const productTemplate = document.getElementById('product-template');
    const addProductButton = document.getElementById('adminAdd');
    const formTemplate = document.querySelector('#form-template');
    const modifyContainer = document.querySelector('#add-product');
    const response = await getJSON('/api/products');

    /**
     * Function to modify product
     * 
     * @param {any} event Event of button
     * @returns {Promise<void>}
     */
    const modifyProduct = async event => {

        event.preventDefault();
        const form = event.target;
        const id = form.querySelector('#id-input').value;
        const name = form.querySelector('#name-input').value;
        const price = form.querySelector('#price-input').value;
        const image = form.querySelector('#image-input').value;
        const description = form.querySelector('#description-input').value;
        const userData = { name: name, price: price, image: image, description: description };

        try {
            const user = await postOrPutJSON(`/api/products/${id}`, 'PUT', userData);
            //document.querySelector(`#role-${id}`).textContent = user.role;
            removeElement('add-product', 'add-product-form');
            return createNotification(`Product ${name} modified succesfully`, 'notifications-container');
        } catch (error) {
            console.error(error);
            return createNotification('Update failed!', 'notifications-container', false);
        }
    };
    /**
     * Adds product to list of products and database
     *  
     * 
     * @param {any} event event of button
     * @returns {Promise<void>}
     */
    const addProduct = async (event) => { 
        
        event.preventDefault();
        const form = event.target;
        const name = form.querySelector('#name-input').value;
        const price = form.querySelector('#price-input').value;
        const image = form.querySelector('#image-input').value;
        const description = form.querySelector('#description-input').value;
        const userData = { name: name, price: price, image: image, description: description };

        
        try {
            const user = await postOrPutJSON('/api/products', 'POST', userData);
            //document.querySelector(`#role-${id}`).textContent = user.role;
            removeElement('add-product', 'add-product-form');
            return createNotification(`Added product succesful`, 'notifications-container');
        } catch (error) {
            console.error(error);
            removeElement('add-product', 'add-product-form');
            return createNotification('Adding failed!', 'notifications-container', false);
        }
        
    };
    /**
     * Shows edit form for adding a product
     * 
     */
    const showEditForm = () => {
        removeElement('add-product', 'add-product-form');
        
        const form = formTemplate.content.cloneNode(true);
        modifyContainer.append(form);
        
        // Use a callback function to add the event listener
        modifyContainer.querySelector('form').addEventListener('submit', addProduct);
        
    };

    /**
     * Shows edit form for modifying a product
     * 
     * @param {any} id ProductId
     * @param {any} name ProductName
     * @param {any} price ProductPrice
     * @param {any} image ProductImage
     * @param {any} description ProductDescription
     */
    const showEditFormModify = (id, name, price, image, description) => {
        removeElement('add-product', 'add-product-form');

        const form = formTemplate.content.cloneNode(true);
        form.querySelector('h2').textContent = `Modify user ${name}`;
        form.querySelector('#name-input').value = name;
        form.querySelector('#price-input').value = price;
        form.querySelector('#image-input').value = image;
        form.querySelector('#description-input').value = description;
        form.querySelector('#id-input').value = id;
        modifyContainer.append(form);
        

        // Use a callback function to add the event listener
        modifyContainer.querySelector('form').addEventListener('submit', modifyProduct);

    };

    addProductButton.addEventListener('click', () => {
        showEditForm();
    });
    /**
     * Delets a product
     * 
     * @param {any} productId ProductID
     * @returns {Promise<void>}
     */
    const deleteProduct = async productId => {

        try {
            const user = await deleteResource(`/api/products/${productId}`);
            removeElement('products-container', `product-${productId}`);
            return createNotification(`Deleted user ${user.name}`, 'notifications-container');
        } catch (error) {
            console.error(error);
            return createNotification('Delete failed!', 'notifications-container', false);
        }
    };
    

    
    response.forEach(product => {
        console.log(product._id);
        const clonedProduct = productTemplate.content.cloneNode(true);
        clonedProduct.querySelector('.product-name').id = `name-${product._id}`;
        clonedProduct.querySelector('.product-description').id = `description-${product._id}`;
        clonedProduct.querySelector('.product-price').id = `price-${product._id}`;


        clonedProduct.getElementById(`name-${product._id}`).textContent = product.name;
        clonedProduct.getElementById(`description-${product._id}`).textContent = product.description;
        clonedProduct.getElementById(`price-${product._id}`).textContent = product.price;
        clonedProduct.querySelector('.item-row').id = `product-${product._id}`;
        clonedProduct.querySelectorAll('[class]').forEach(elem => {
            
            if (elem.classList.contains('add-to-cart')) {
                elem.id = `add-to-cart-${product._id}`;
                console.log(product._id);
                return elem.addEventListener('click', () => addToCart(product._id, product.name));
            }

            if (elem.classList.contains('adminRemove')) {
                elem.id = `adminRemove-${product._id}`;
                return elem.addEventListener('click', () => deleteProduct(product._id));
            }

            if (elem.classList.contains('modify')) {
                elem.id = `modify-${product._id}`;
                return elem.addEventListener('click', () => showEditFormModify(product._id, product.name, product.price, product.image, product.description));
            }
            
            const prop = elem.className.split('-')[1];
            if (!product[prop]) {
                return;
            }

            elem.id = `${prop}-${product._id}`;
            elem.textContent = product[prop];
            
        });

        // Append the cloned product to the 'products-container'
        
        productsContainer.appendChild(clonedProduct);
    });
})();