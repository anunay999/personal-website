// Get the theme toggle input
const themeToggle = document.querySelector(
    '.theme-switch input[type="checkbox"]'
  );

// Get the current theme from local storage
const currentTheme = localStorage.getItem("theme");

// If the current local storage item can be found and themeToggle exists
if (currentTheme && themeToggle instanceof HTMLInputElement) {
// Set the body data-theme attribute to match the local storage item
document.documentElement.setAttribute("data-theme", currentTheme);

// If the current theme is dark, check the theme toggle
if (currentTheme === "halloween") {
    themeToggle.checked = true;
}
}

// Function that will switch the theme based on if the theme toggle is checked or not
function switchTheme(e) {
if (e.target.checked) {
    document.documentElement.setAttribute("data-theme", "halloween");
    localStorage.setItem("theme", "halloween");
} else {
    document.documentElement.setAttribute("data-theme", "fantasy");
    localStorage.setItem("theme", "fantasy");
}
}

// Add an event listener to the theme toggle, which will switch the theme
if (themeToggle) {
themeToggle.addEventListener("change", switchTheme, false);
}