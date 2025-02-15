document.addEventListener("DOMContentLoaded", () => {
  fetchUsers();
});

// Fetch and Display Users
function fetchUsers() {
  fetch("http://127.0.0.1:5000/users")
    .then((response) => response.json())
    .then((data) => {
      const tableBody = document.querySelector("tbody");
      tableBody.innerHTML = "";

      data.users.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
              <div class="action-buttons">
                <button class="approve-button" onclick="updateUser(${user.id})">Update</button>
                <button class="reject-button" onclick="deleteUser(${user.id})">Delete</button>
              </div>
            </td>
          `;
        tableBody.appendChild(row);
      });
    })
    .catch((error) => console.error("Error fetching users:", error));
}

// Create User
function createUser() {
  Swal.fire({
    title: "Create User",
    html: `
        <input type="text" id="newUsername" class="swal2-input" placeholder="Username">
        <input type="email" id="newEmail" class="swal2-input" placeholder="Email">
      `,
    confirmButtonText: "Create",
    showCancelButton: true,
    preConfirm: () => {
      const username = document.getElementById("newUsername").value;
      const email = document.getElementById("newEmail").value;

      if (!username || !email) {
        Swal.showValidationMessage("All fields are required");
        return false;
      }

      return fetch("http://127.0.0.1:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      })
        .then((response) => response.json())
        .then((data) => {
          Swal.fire("Success", data.message, "success");
          fetchUsers();
        })
        .catch((error) => {
          Swal.fire("Error", "Failed to create user", "error");
        });
    },
  });
}

// View User Details
function viewUser(userId) {
  fetch(`http://127.0.0.1:5000/users/${userId}`)
    .then((response) => response.json())
    .then((data) => {
      Swal.fire({
        title: `User Details`,
        html: `
            <p><strong>ID:</strong> ${data.id}</p>
            <p><strong>Username:</strong> ${data.username}</p>
            <p><strong>Email:</strong> ${data.email}</p>
          `,
        confirmButtonText: "Close",
      });
    })
    .catch((error) => console.error("Error fetching user:", error));
}

// Update User
function updateUser(userId) {
  Swal.fire({
    title: "Update User",
    html: `
        <input type="text" id="updateUsername" class="swal2-input" placeholder="New Username">
        <input type="email" id="updateEmail" class="swal2-input" placeholder="New Email">
      `,
    confirmButtonText: "Update",
    showCancelButton: true,
    preConfirm: () => {
      const username = document.getElementById("updateUsername").value;
      const email = document.getElementById("updateEmail").value;

      if (!username || !email) {
        Swal.showValidationMessage("All fields are required");
        return false;
      }

      return fetch(`http://127.0.0.1:5000/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      })
        .then((response) => response.json())
        .then((data) => {
          Swal.fire("Success", data.message, "success");
          fetchUsers();
        })
        .catch((error) => {
          Swal.fire("Error", "Failed to update user", "error");
        });
    },
  });
}

// Delete User
function deleteUser(userId) {
  Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      fetch(`http://127.0.0.1:5000/users/${userId}`, { method: "DELETE" })
        .then((response) => response.json())
        .then((data) => {
          Swal.fire("Deleted!", data.message, "success");
          fetchUsers();
        })
        .catch((error) => {
          Swal.fire("Error", "Failed to delete user", "error");
        });
    }
  });
}
