// login.js
function redirectTo(page) {
    window.location.href = page;
}

document.addEventListener('DOMContentLoaded', function () {
    function redirectTo(page) {
        window.location.href = page;
    }

    const loginForm = document.getElementById('login-form');
    const loginErrorMessageDiv = document.getElementById('login-error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const email = document.getElementById('Email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const result = await response.json();

                if (response.ok) {
                    // If the response is OK, redirect to the dashboard or perform other actions
                    // TODO
                    //window.location.href = '/dashboard';
                    console.log("Login was successful");
                } else {
                    // If the response is not OK, show error message
                    loginErrorMessageDiv.textContent = result.message;
                    loginErrorMessageDiv.style.display = 'block';
                }
            } catch (error) {
                console.error(error);
            }
        });
    }
});