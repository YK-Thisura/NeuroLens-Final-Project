document.addEventListener("DOMContentLoaded", function () {
  // Modal and Download Logic
  const modal = document.getElementById("approvalModal");
  const closeBtn = document.getElementsByClassName("close")[0];
  const downloadBtn = document.getElementById("downloadBtn");
  const approvalNoteList = document.getElementById("approvalNoteList");

  if (downloadBtn) {
    // Open Modal with approval notes
    downloadBtn.addEventListener("click", function () {
      // Fetch approval notes and dynamically add to the list
      fetch("http://127.0.0.1:5000/get_approval_notes")
        .then((response) => response.json())
        .then((data) => {
          // Clear the list before adding new items

          console.log(data);

          approvalNoteList.innerHTML = "";
          data.notes.forEach((note) => {
            const listItem = document.createElement("li");
            const patientName = document.createElement("p");
            const createdAt = document.createElement("p");
            const downloadLink = document.createElement("a");

            // Add patient name and created at time
            patientName.textContent = `Patient Name: ${note.patient_name}`;
            createdAt.textContent = `Created At: ${new Date(
              note.created_at
            ).toLocaleString()}`;

            // Create download link
            downloadLink.href = note.download_url;
            downloadLink.textContent = "Download Approval Note";

            // Append elements to the list item
            listItem.appendChild(patientName);
            listItem.appendChild(createdAt);
            listItem.appendChild(downloadLink);
            approvalNoteList.appendChild(listItem);
          });
        })
        .catch((error) => {
          console.error("Error fetching approval notes:", error);
        });

      // Show the modal
      modal.style.display = "block";
    });
  }

  // Close modal when clicking the close button
  if (closeBtn) {
    closeBtn.addEventListener("click", function () {
      modal.style.display = "none";
    });
  }

  // Close modal when clicking outside the modal content
  window.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
});
let username = localStorage.getItem("username");

if (username) {
  document.getElementById("userName").textContent = `${username}`;
}
