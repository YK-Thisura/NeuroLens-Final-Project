document.addEventListener("DOMContentLoaded", function () {
  const tableBody = document.querySelector("tbody");

  // Fetch and display all doctors
  function fetchDoctors() {
    fetch("http://127.0.0.1:5000/users/doctors")
      .then((response) => response.json())
      .then((data) => {
        tableBody.innerHTML = ""; // Clear existing rows
        data.doctors.forEach((doctor) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${doctor.id}</td>
              <td>${doctor.username}</td>
              <td>${doctor.email}</td>
              <td>
                <div class="action-buttons">
                  <button class="approve-button update-button" data-id="${doctor.id}">Update</button>
                  <button class="reject-button delete-button" data-id="${doctor.id}">Delete</button>
                </div>
              </td>
            `;
          tableBody.appendChild(row);
        });

        attachEventListeners();
      })
      .catch((error) => console.error("Error fetching doctors:", error));
  }

  // Attach event listeners to buttons dynamically
  function attachEventListeners() {
    document.querySelectorAll(".update-button").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const doctorId = event.target.getAttribute("data-id");
        updateDoctor(doctorId);
      });
    });

    document.querySelectorAll(".delete-button").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const doctorId = event.target.getAttribute("data-id");
        deleteDoctor(doctorId);
      });
    });
  }

  // Update Doctor (Prompt for new username/email and send PUT request)
  function updateDoctor(doctorId) {
    Swal.fire({
      title: "Update Doctor",
      html: `
        <input id="swal-username" class="swal2-input" placeholder="New Username">
        <input id="swal-email" class="swal2-input" placeholder="New Email (must start with 'dr.')">
      `,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: () => {
        const newUsername = document.getElementById("swal-username").value;
        const newEmail = document.getElementById("swal-email").value;

        if (!newEmail.toLowerCase().startsWith("dr.")) {
          Swal.showValidationMessage("Email must start with 'dr.'");
          return false;
        }

        return { newUsername, newEmail };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://127.0.0.1:5000/users/doctors/${doctorId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: result.value.newUsername,
            email: result.value.newEmail,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            Swal.fire("Updated!", data.message, "success");
            fetchDoctors(); // Refresh table
          })
          .catch((error) => {
            console.error("Error updating doctor:", error);
            Swal.fire("Error", "Failed to update doctor", "error");
          });
      }
    });
  }

  // Delete Doctor (Confirm and send DELETE request)
  function deleteDoctor(doctorId) {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://127.0.0.1:5000/users/doctors/${doctorId}`, {
          method: "DELETE",
        })
          .then((response) => response.json())
          .then((data) => {
            Swal.fire("Deleted!", data.message, "success");
            fetchDoctors(); // Refresh table
          })
          .catch((error) => {
            console.error("Error deleting doctor:", error);
            Swal.fire("Error", "Failed to delete doctor", "error");
          });
      }
    });
  }

  // Initialize page
  fetchDoctors();
});
