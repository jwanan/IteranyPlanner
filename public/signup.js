
//signup.js
function redirectTo(page) {
    window.location.href = page;
}

document.addEventListener('DOMContentLoaded', function () {
  const signupForm = document.querySelector('form');
  const errorMessageDiv = document.getElementById('error-message');
  const successMessageDiv = document.getElementById('success-message');

  signupForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      // Display error message on the webpage
      errorMessageDiv.textContent = 'Password and Confirm Password do not match';
      errorMessageDiv.style.display = 'block';
      return;
    }

    // Clear any previous error messages
    errorMessageDiv.textContent = '';
    errorMessageDiv.style.display = 'none';

    try {
      const response = await fetch('/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          confirmPassword,
        }),
      });      

      const result = await response.json();
      
      if (response.ok) {
        // If the response is OK, show success message
        successMessageDiv.textContent = result.message;
        successMessageDiv.style.display = 'block';
      } else {
        // If the response is not OK, show error message
        errorMessageDiv.textContent = result.message;
        errorMessageDiv.style.display = 'block';
      }
    } catch (error) {
      console.error(error);
    }
  });
});