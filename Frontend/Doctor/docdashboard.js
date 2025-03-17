document
  .getElementById("createGigButton")
  .addEventListener("click", function () {
    window.location.href = "docform.html";
  });

document.getElementById("approvalNote").addEventListener("click", function () {
  window.location.href = "docverify.html";
});

document.addEventListener("DOMContentLoaded", function () {
  const viewPrescriptionBtn = document.querySelector(".card:nth-child(2) .btn");
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Prescription List</h2>
      <ul id="prescriptionList"></ul>
    </div>
  `;
  document.body.appendChild(modal);

  viewPrescriptionBtn.addEventListener("click", async function () {
    try {
      const response = await fetch("http://127.0.0.1:5000/get_prescriptions");
      const data = await response.json();
      console.log(data); // Log the full response to check its structure

      // Ensure the response contains a 'prescriptions' key that is an array
      if (Array.isArray(data.prescriptions)) {
        const prescriptionList = document.getElementById("prescriptionList");
        prescriptionList.innerHTML = ""; // Clear the list first

        // Loop through the prescriptions array using forEach
        data.prescriptions.forEach(function (p) {
          const listItem = document.createElement("li");
          listItem.innerHTML = `
            <strong>Doctor ID: ${p.doctor_id}</strong> - ${new Date(
            p.uploaded_at
          ).toLocaleDateString()} 
            <a href="http://127.0.0.1:5000/download/${
              p.file_path
            }" target="_blank">Download</a>
          `;
          prescriptionList.appendChild(listItem);
        });

        modal.style.display = "block";
      } else {
        console.error(
          "The response does not contain an array under the 'prescriptions' key:",
          data
        );
        alert("Error: The response data is not in the expected format.");
      }
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
      alert("Error fetching prescription list.");
    }
  });

  // Close Modal
  modal.querySelector(".close").addEventListener("click", function () {
    modal.style.display = "none";
  });

  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});

let username = localStorage.getItem("username");

if (username) {
  document.getElementById("doctorName").textContent = `Dr. ${username}`;
}
