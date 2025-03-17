let isLoggedIn = localStorage.getItem("token"); // Check if user is logged in
let userRole = localStorage.getItem("role");
const doctorIcon = document.getElementById("doctorIcon"); // Doctor icon
const userIcon = document.getElementById("profileIcon"); // Doctor icon

if (isLoggedIn) {
  //   document.getElementById("userIcons").style.display = "flex";
  document.getElementById("loginButton").style.display = "none";
  if (userRole === "user") {
    doctorIcon.style.display = "none";
  } else {
    userIcon.style.display = "none";
  }
} else {
  document.getElementById("userIcons").style.display = "none";
  document.getElementById("loginButton").style.display = "block";
}

// Logout Functionality
document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  //   window.location.reload();
  window.location.href = "../User/home.html";
});
