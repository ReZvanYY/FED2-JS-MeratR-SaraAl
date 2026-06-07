const token = localStorage.getItem("accessToken");

// Check if user is signed in
function isSignedIn() {
  return !!token; // returns true if token exists, false otherwise
}
// Redirect to sign-in page
function signOut() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
  window.location.href = "/HTML/sign-in-page.html";
}

const nav = document.querySelector("nav");
const headerMenu = document.getElementById("toggle-menu-display-area");
const toggleMenuButtonImage = document.getElementById("toggle-menu");
const toggleMenuButton = document.querySelector("header nav button");

if (toggleMenuButton) {
  toggleMenuButton.setAttribute("aria-label", "Toggle navigation menu");
  toggleMenuButton.setAttribute("aria-expanded", "false");
  toggleMenuButton.setAttribute("aria-controls", "toggled-menu");
}

//generic photo used by default
const genericProfileImg = "https://i.imghippo.com/files/ZyN1996XVE.png";

// Rendering profile img.
function renderProfileImg() {
  let existingProfileLink = nav.querySelector(".profile-link");
  if (existingProfileLink) existingProfileLink.remove();

  const profileLink = document.createElement("a");
  profileLink.className = "profile-link";

  const currentImg = document.createElement("img");
  currentImg.className = "w-14 rounded-full justify-start";
  currentImg.alt = "current users profile picture or img.";
  if (isSignedIn()) {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    currentImg.src = currentUser.profileImage || genericProfileImg;
    profileLink.href = "/HTML/user-page.html";
  } else {
    currentImg.src = genericProfileImg;
    profileLink.href = "/HTML/sign-in-page.html";
  }
  profileLink.appendChild(currentImg);
  nav.insertBefore(profileLink, nav.firstChild);
}

// Create menu container
const menu = document.createElement("div");
menu.id = "toggled-menu";
menu.classList = "flex flex-col w-full p-4";
menu.setAttribute("role", "menu");
menu.setAttribute("aria-label", "Site menu");
menu.setAttribute("aria-hidden", "true");
menu.style.display = "none"; // Initially hidden
headerMenu.appendChild(menu);

let menuVisible = false;

// Function to toggle menu visibility
function renderToggleMenu() {
  menu.innerHTML = ""; // Clear previous content

  if (isSignedIn()) {
    const user = JSON.parse(localStorage.getItem("user"));
    const welcomeMsg = document.createElement("div");
    welcomeMsg.textContent = `Welcome, ${user.name || "User"}`;
    menu.appendChild(welcomeMsg);

    const homeButton = document.createElement("button");
    homeButton.textContent = "HOME";
    homeButton.setAttribute("role", "menuitem");
    homeButton.setAttribute("aria-label", "Go to home page");
    homeButton.onclick = () => {
      window.location.href = "../index.html";
    };
    menu.appendChild(homeButton);

    const profileButton = document.createElement("button");
    profileButton.textContent = "PROFILE";
    profileButton.setAttribute("role", "menuitem");
    profileButton.setAttribute("aria-label", "Go to your profile");
    profileButton.onclick = () => {
      window.location.href = "/HTML/user-page.html";
    };
    menu.appendChild(profileButton);

    const signOutButton = document.createElement("button");
    signOutButton.textContent = "SIGN OUT";
    signOutButton.setAttribute("role", "menuitem");
    signOutButton.setAttribute("aria-label", "Sign out from your account");
    signOutButton.onclick = signOut;
    menu.appendChild(signOutButton);
  } else {
    const homeButton = document.createElement("button");
    homeButton.textContent = "HOME";
    homeButton.setAttribute("role", "menuitem");
    homeButton.setAttribute("aria-label", "Go to home page");
    homeButton.onclick = () => {
      window.location.href = "../index.html";
    };
    menu.appendChild(homeButton);

    const signInButton = document.createElement("button");
    signInButton.textContent = "SIGN IN";
    signInButton.setAttribute("role", "menuitem");
    signInButton.setAttribute("aria-label", "Go to sign in page");
    signInButton.onclick = () => {
      window.location.href = "/HTML/sign-in-page.html";
    };
    menu.appendChild(signInButton);

    const registerButton = document.createElement("button");
    registerButton.textContent = "SIGN UP";
    registerButton.setAttribute("role", "menuitem");
    registerButton.setAttribute("aria-label", "Go to sign up page");
    registerButton.onclick = () => {
      window.location.href = "/HTML/sign-up-page.html";
    };
    menu.appendChild(registerButton);
  }
}

// Toggle menu on button click
if (toggleMenuButton) {
  toggleMenuButton.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent event from bubbling up to document

    if (menuVisible) {
      menu.style.display = "none";
      menu.setAttribute("aria-hidden", "true");
      toggleMenuButton.setAttribute("aria-expanded", "false");
      toggleMenuButtonImage.src =
        "https://i.imghippo.com/files/LKqc2461NZo.png"; // hamburger icon
    } else {
      renderToggleMenu();
      menu.style.display = "flex";
      menu.setAttribute("aria-hidden", "false");
      toggleMenuButton.setAttribute("aria-expanded", "true");
      toggleMenuButtonImage.src = "https://i.imghippo.com/files/qC2915DQI.png"; // close icon
    }
    menuVisible = !menuVisible;
  });
}

// Close menu when clicking outside
document.addEventListener("click", (e) => {
  if (!headerMenu.contains(e.target)) {
    menu.style.display = "none";
    menu.setAttribute("aria-hidden", "true");
    if (toggleMenuButton) {
      toggleMenuButton.setAttribute("aria-expanded", "false");
    }
    toggleMenuButtonImage.src = "https://i.imghippo.com/files/LKqc2461NZo.png"; // hamburger icon
    menuVisible = false;
  }
});

// Initial render
renderToggleMenu();
renderProfileImg();
