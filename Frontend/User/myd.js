// document.addEventListener("DOMContentLoaded", function () {
// Function to fetch doctor data and populate the cards
function fetchDoctors() {
  fetch("http://127.0.0.1:5000/get_approved_doctors_gig")
    .then((response) => response.json())
    .then((data) => {
      if (data.doctors && data.doctors.length > 0) {
        const cardsContainer = document.querySelector(".cards-container");

        // Clear existing content if any
        cardsContainer.innerHTML = "";

        data.doctors.forEach((doctor) => {
          // Create a new card element for each doctor
          const card = document.createElement("div");
          card.classList.add("card");

          // Create the content for the card
          const cardImage = document.createElement("img");

          cardImage.src = doctor.image
            ? `data:image/jpeg;base64,${doctor.image}`
            : "https://via.placeholder.com/300x180";
          cardImage.alt = "Doctor Image";
          cardImage.classList.add("card-image");

          const cardContent = document.createElement("div");
          cardContent.classList.add("card-content");

          const adBy = document.createElement("p");
          adBy.classList.add("ad-by");
          adBy.innerHTML = `Dr. <span class="ad-name">${doctor.first_name} ${doctor.last_name}</span>`;

          const badge = document.createElement("span");
          badge.classList.add("badge", doctor.specialization.toLowerCase()); // Add specialization as class
          badge.textContent = doctor.specialization;

          const heading = document.createElement("h3");
          heading.textContent = `${doctor.description}`;

          const rating = document.createElement("p");
          rating.classList.add("rating");
          rating.textContent = `⭐ 5.0 (702)`;

          const country = document.createElement("p");
          country.classList.add("country");
          country.innerHTML = `<strong>${doctor.country}</strong>`;

          // Append elements to the card
          cardContent.appendChild(adBy);
          cardContent.appendChild(badge);
          cardContent.appendChild(heading);
          cardContent.appendChild(rating);
          cardContent.appendChild(country);

          card.appendChild(cardImage);
          card.appendChild(cardContent);

          cardContent.addEventListener("click", () => {
            window.location.href = `../Doctor/docprofile.html?id=${doctor.id}`;
          });

          // Append the card to the container
          cardsContainer.appendChild(card);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching doctor data:", error);
    });
}

// Call the fetchDoctors function when the page loads
fetchDoctors();

let isLoggedIn = localStorage.getItem("token"); // Check if user is logged in
let userRole = localStorage.getItem("role");
const doctorIcon = document.getElementById("doctorIcon"); // Doctor icon
const userIcon = document.getElementById("profileIcon"); // Doctor icon

if (isLoggedIn) {
  document.getElementById("userIcons").style.display = "flex";
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
