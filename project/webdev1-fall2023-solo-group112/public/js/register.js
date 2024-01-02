
const registerForm = document.getElementById('register-form');
const notificationsContainer = document.getElementById('notifications-container');

registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Retrieve form input values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirmation = document.getElementById('passwordConfirmation').value;

    // Validate whether password and password confirmation match
    if (password !== passwordConfirmation) {
        utils.createNotification('Password and password confirmation do not match.', 'notifications-container', false);
        return;
    }

    const userData = { _id: generateId(), name: name, email: email, password: password, role: "customer" };
    // Prepare the data to send to the server

    postOrPutJSON('/api/register', 'POST', userData)
        .then(json => {
            createNotification('Registration successful.', 'notifications-container', true);
            registerForm.reset();
        })
        .catch(error => {
            createNotification('An error occurred. Please try again later.', 'notifications-container', false);
            console.error(error);
        });
});



