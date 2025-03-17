const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// document.addEventListener("DOMContentLoaded", () => {
const signInForm = document.querySelector(".sign-in-form");
const signUpForm = document.querySelector(".sign-up-form");

// Handle Signup
signUpForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = event.target.querySelector(
    "input[placeholder='Username']"
  ).value;
  const email = event.target.querySelector("input[placeholder='Email']").value;
  const password = event.target.querySelector(
    "input[placeholder='Password']"
  ).value;

  const response = await fetch("http://127.0.0.1:5000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    Swal.fire({
      icon: "success",
      title: "Signup Successful!",
      text: "Redirecting to login...",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      container.classList.remove("sign-up-mode"); // Switch to login form
      signUpForm.reset();
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Signup Failed",
      text: data.error || "Something went wrong!",
    });
  }
});

// Handle Login
// signInForm.addEventListener("submit", async (event) => {
//   event.preventDefault();

//   const email = event.target.querySelector("input[placeholder='Email']").value;
//   const password = event.target.querySelector(
//     "input[placeholder='Password']"
//   ).value;

//   const response = await fetch("http://127.0.0.1:5000/login", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });

//   const data = await response.json();

//   if (response.ok) {
//     localStorage.setItem("token", data.access_token);
//     const userRole = email.toLowerCase().startsWith("dr.") ? "doctor" : "user";
//     localStorage.setItem("role", userRole);
//     localStorage.setItem("username", data.username);
//     Swal.fire({
//       icon: "success",
//       title: "Login Successful!",
//       text: "Redirecting to home page...",
//       timer: 2000,
//       showConfirmButton: false,
//     }).then(() => {
//       window.location.href = "../User/home.html";
//     });
//   } else {
//     Swal.fire({
//       icon: "error",
//       title: "Login Failed",
//       text: data.error || "Invalid credentials",
//     });
//   }
// });

signInForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = event.target.querySelector("input[placeholder='Email']").value;
  const password = event.target.querySelector(
    "input[placeholder='Password']"
  ).value;

  // Check for admin credentials
  if (email === "admin@123" && password === "1234") {
    localStorage.setItem("role", "admin");
    Swal.fire({
      icon: "success",
      title: "Login Successful!",
      text: "Redirecting to admin page...",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "../Admin/admin.html"; // Redirect to admin page
    });
    return; // Exit the function early to avoid further checks
  }

  // Regular login process
  const response = await fetch("http://127.0.0.1:5000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (response.ok) {
    localStorage.setItem("token", data.access_token);
    const userRole = email.toLowerCase().startsWith("dr.") ? "doctor" : "user";
    localStorage.setItem("role", userRole);
    localStorage.setItem("username", data.username);
    Swal.fire({
      icon: "success",
      title: "Login Successful!",
      text: "Redirecting to home page...",
      timer: 2000,
      showConfirmButton: false,
    }).then(() => {
      window.location.href = "../User/home.html";
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Login Failed",
      text: data.error || "Invalid credentials",
    });
  }
});

// });
