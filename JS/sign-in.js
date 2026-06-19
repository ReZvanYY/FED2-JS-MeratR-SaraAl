// Sign-in form
const loginForm = document.getElementById('login-form');
// Divs for displaying messages
const logInErrorDiv = document.createElement('div');
const logInSuccessDiv = document.createElement('div');

logInErrorDiv.id = 'login-error';
logInErrorDiv.setAttribute('role', 'alert');
logInErrorDiv.setAttribute('aria-live', 'assertive');
logInErrorDiv.setAttribute('aria-atomic', 'true');
logInSuccessDiv.id = 'login-success';
logInSuccessDiv.setAttribute('role', 'status');
logInSuccessDiv.setAttribute('aria-live', 'polite');
logInSuccessDiv.setAttribute('aria-atomic', 'true');

loginForm.appendChild(logInErrorDiv);
loginForm.appendChild(logInSuccessDiv);

// Event listener for form submission
loginForm.addEventListener('submit', async function (event){
    event.preventDefault();

    // Clear previous messages
    logInErrorDiv.textContent = '';
    logInSuccessDiv.textContent = '';

    // Get and validate input values
    const emailField = document.getElementById('email-login');
    const passwordField = document.getElementById('password-login');
    const emailInput = emailField.value.trim().toLowerCase();
    const passwordInput = passwordField.value;

    emailField.removeAttribute('aria-invalid');
    passwordField.removeAttribute('aria-invalid');
    logInErrorDiv.textContent = '';
    logInSuccessDiv.textContent = '';

    // Basic validation
    if (!emailInput || !passwordInput){
        logInErrorDiv.textContent = 'Please fill in all fields';
        logInErrorDiv.style.color = 'darkred';
        if (!emailInput) emailField.setAttribute('aria-invalid', 'true');
        if (!passwordInput) passwordField.setAttribute('aria-invalid', 'true');
        return;
    }
 
    // Send login request
    try {
        const loginResponse = await fetch("https://v2.api.noroff.dev/auth/login",{
            method: "POST",
            headers: { "Content-Type" : "application/json" 
            },
            body: JSON.stringify({email: emailInput, password: passwordInput })
        });
        // Parse json and respons
        const loginResult = await loginResponse.json();

        if (!loginResponse.ok){
            logInErrorDiv.textContent = loginResult.message || 'Login failed';
            logInErrorDiv.style.color = 'darkred';
            emailField.setAttribute('aria-invalid', 'true');
            return;
        }
        const { accessToken, ...userData } = loginResult.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

        const apiKeyResponse = await fetch("https://v2.api.noroff.dev/auth/create-api-key", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: "AuthKey" })
        });

        const apiKeyResult = await apiKeyResponse.json();
        if(!apiKeyResponse.ok){
            throw new Error(apiKeyResult.message || "Failed to generate API key");
        }

        localStorage.setItem("apiKey", apiKeyResult.data.key);

        // Successful login
        logInSuccessDiv.textContent = 'Login successful! Redirecting...';
        logInSuccessDiv.style.color = 'green';
        emailField.removeAttribute('aria-invalid');
        passwordField.removeAttribute('aria-invalid');
        loginForm.reset();

        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = '../index.html'
        }, 2000);

        //catch errors during fetch
    } catch (error) {
        logInErrorDiv.textContent = 'An error occurred. Please try again later.';
        logInErrorDiv.style.color = 'darkred';
        console.error('Error during login:', error);
    }
});
