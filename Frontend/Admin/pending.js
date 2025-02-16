// Function to fetch all doctors from the API
async function getDoctors() {
  try {
    const response = await fetch("http://127.0.0.1:5000/get_all_doctors_gig");
    const data = await response.json();

    if (response.ok) {
      const doctors = data.doctors;
      const tableBody = document.querySelector("#doctorTable tbody");
      tableBody.innerHTML = ""; // Clear any existing rows

      console.log(doctors);

      doctors.forEach((doctor) => {
        // Create a new row for each doctor
        const row = document.createElement("tr");

        const doctorImage = doctor.image
          ? `<img src="data:image/jpeg;base64,${doctor.image}" alt="${doctor.first_name} ${doctor.last_name}" class="profile-pic" />`
          : "No Image";
        const actions = `
              <div class="action-buttons">
                <button class="approve-button" onclick="updateDoctorStatus(${doctor.id}, 'approve')">Approve</button>
                <button class="reject-button" onclick="updateDoctorStatus(${doctor.id}, 'reject')">Reject</button>
              </div>
            `;

        row.innerHTML = `
              <td>${doctor.id}</td>
              <td>${doctorImage}</td>
              <td>${doctor.first_name} ${doctor.last_name}</td>
              <td>${doctor.email}</td>
              <td>${doctor.status}</td>
              <td>${actions}</td>
            `;

        tableBody.appendChild(row);
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "Error fetching doctor data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error("Error fetching doctor data:", error);
    Swal.fire({
      title: "Error",
      text: "Error fetching doctor data.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

// Function to update the doctor status (approve or reject)
async function updateDoctorStatus(doctorId, action) {
  try {
    const response = await fetch("http://127.0.0.1:5000/update_doctor_status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: doctorId,
        action: action, // 'approve' or 'reject'
      }),
    });

    const data = await response.json();

    console.log(response);

    if (response.ok) {
      Swal.fire({
        title: "Success",
        text: data.message, // Show success message
        icon: "success",
        confirmButtonText: "OK",
      });

      // Reload doctors data to reflect changes
      getDoctors();
    } else {
      Swal.fire({
        title: "Error",
        text: data.error || "An error occurred.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    Swal.fire({
      title: "Error",
      text: "Error updating status.",
      icon: "error",
      confirmButtonText: "OK",
    });
  }
}

// Fetch doctors when the page loads
window.onload = getDoctors;
