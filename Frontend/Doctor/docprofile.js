document.addEventListener("DOMContentLoaded", async function () {
  // Get doctor ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const doctorId = urlParams.get("id");

  if (!doctorId) {
    console.error("No doctor ID found in URL");
    return;
  }

  if (doctorId) {
    document.getElementById("doctor_id").value = doctorId;
  } else {
    Swal.fire({
      icon: "error",
      title: "Missing Doctor ID",
      text: "Doctor ID is missing in the URL!",
    });
  }

  const apiUrl = `http://127.0.0.1:5000/get_doctor/${doctorId}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch doctor data");
    }

    const doctor = await response.json();

    // Update Profile Image
    const profileImage = document.querySelector(".profile-pic");
    if (doctor.image) {
      profileImage.src = `data:image/jpeg;base64,${doctor.image}`;
    }

    // Update Basic Info
    document.querySelector(
      ".basic-info h2"
    ).textContent = `Dr. ${doctor.first_name} ${doctor.last_name}`;
    document.querySelector(".basic-info").innerHTML = `
          <p><strong>Age:</strong> ${doctor.age || "N/A"}</p>
          <p><strong>Gender:</strong> ${doctor.gender || "N/A"}</p>
          <p><strong>Country:</strong> ${doctor.country || "N/A"}</p>
          <p><strong>Email:</strong> ${doctor.email}</p>
          <p><strong>Contact:</strong> ${doctor.contact || "N/A"}</p>
        `;

    // Update Specializations
    const specializationsList = document.querySelector(".specialization ul");
    specializationsList.innerHTML = doctor.specialization
      ? doctor.specialization
          .split(",")
          .map((spec) => `<li>${spec.trim()}</li>`)
          .join("")
      : "<li>No specializations available</li>";

    // Update Qualification
    document.querySelector(".qualification p").textContent =
      doctor.qualification || "Not Available";

    // Update Description
    document.querySelector(".description p").textContent =
      doctor.description || "No description available.";
  } catch (error) {
    console.error("Error loading doctor profile:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to load doctor profile. Please try again later.",
    });
  }
});

document
  .getElementById("uploadForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const fileInput = document.getElementById("prescription");
    const doctorId = document.getElementById("doctor_id").value;

    if (!fileInput.files.length) {
      Swal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select a file before uploading.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("prescription", fileInput.files[0]);
    formData.append("doctor_id", doctorId);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/upload_prescription",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Prescription uploaded successfully!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Upload Error",
          text: data.error || "An error occurred while uploading.",
        });
      }
    } catch (error) {
      console.error("Upload failed:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Upload failed. Please try again.",
      });
    }
  });

let username = localStorage.getItem("username");

if (username) {
  document.getElementById("doctorName").textContent = `${username}`;
}
