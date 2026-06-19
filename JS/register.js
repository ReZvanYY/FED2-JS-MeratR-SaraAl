// Get the form element
const form = document.getElementById("register-form");

// Create divs for displaying messages
const errorDiv = document.createElement("div");
errorDiv.id = "register-error";
errorDiv.setAttribute("role", "alert");
errorDiv.setAttribute("aria-live", "assertive");
errorDiv.setAttribute("aria-atomic", "true");
form.appendChild(errorDiv);
const successDiv = document.createElement("div");
successDiv.id = "register-success";
successDiv.setAttribute("role", "status");
successDiv.setAttribute("aria-live", "polite");
successDiv.setAttribute("aria-atomic", "true");
form.appendChild(successDiv);

// Event listener for form submission
form.addEventListener("submit", async function (event) {
  event.preventDefault();

  // Clear previous messages
  errorDiv.textContent = "";
  successDiv.textContent = "";

  const nameField = document.getElementById("name");
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const confirmPasswordField = document.getElementById("confirm-password");

  nameField.removeAttribute("aria-invalid");
  emailField.removeAttribute("aria-invalid");
  passwordField.removeAttribute("aria-invalid");
  confirmPasswordField.removeAttribute("aria-invalid");

  // Get form values
  const nameInput = nameField.value.trim();
  const emailInput = emailField.value.trim().toLowerCase();
  const passwordInput = passwordField.value;
  const confirmPasswordInput = confirmPasswordField.value;

  // Validation
  if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
    errorDiv.textContent = "All fields are required.";
    errorDiv.style.color = "darkred";
    if (!nameInput) nameField.setAttribute("aria-invalid", "true");
    if (!emailInput) emailField.setAttribute("aria-invalid", "true");
    if (!passwordInput) passwordField.setAttribute("aria-invalid", "true");
    if (!confirmPasswordInput) confirmPasswordField.setAttribute("aria-invalid", "true");
    return;
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(passwordInput)) {
    errorDiv.textContent =
      "Password must be at least 8 characters long and contain letters and numbers.";
    errorDiv.style.color = "darkred";
    passwordField.setAttribute("aria-invalid", "true");
    return;
  }

  if (passwordInput !== confirmPasswordInput) {
    errorDiv.textContent = "Passwords do not match.";
    errorDiv.style.color = "darkred";
    passwordField.setAttribute("aria-invalid", "true");
    confirmPasswordField.setAttribute("aria-invalid", "true");
    return;
  }

  // Prepare registration payload
  const registerData = {
    name: nameInput,
    email: emailInput,
    password: passwordInput,
  };

  try {
    // API call to register the user
    const registrationResponse = await fetch(
      "https://v2.api.noroff.dev/auth/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      }
    );

    const registrationResult = await registrationResponse.json();

    if (!registrationResponse.ok) {
      const message =
        registrationResult.errors?.[0]?.message ||
        registrationResult.message ||
        "Registration failed";
      throw new Error(message);
    }

    // Register successful -> login to get token
    const loginResponse = await fetch("https://v2.api.noroff.dev/auth/login", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify({
            email: emailInput,
            password: passwordInput,
        }),
    });
    const loginResult = await loginResponse.json();
    if(!loginResponse.ok){
        throw new Error(loginResult.message || "Login after registeration failed");
    }
    const { accessToken, ...userData } = loginResult.data;

    //Store token and user
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));

    // Create API key with token
    const apiKeyResponse = await fetch("https://v2.api.noroff.dev/auth/create-api-key",{
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json" 
        },
    });
    
    const apiKeyResult = await apiKeyResponse.json();
    if (!apiKeyResult.ok){
        throw new Error(apiKeyResult.message || "Failed to generate API Key");
    }

    const apiKey = apiKeyResult.data.key;
    localStorage.setItem("apiKey", apiKey);

    // Success message
    successDiv.textContent = "Register successful! Redirecting to Home Page";
    successDiv.style.color = "green";
    nameField.removeAttribute("aria-invalid");
    emailField.removeAttribute("aria-invalid");
    passwordField.removeAttribute("aria-invalid");
    confirmPasswordField.removeAttribute("aria-invalid");
    form.reset();

    //Time function for redirect
    setTimeout(() =>{
        window.location.href = "../index.html";
    }, 2000);
    } catch (error){
        errorDiv.textContent = error.message;
        errorDiv.style.color = "darkred";
    }
});
