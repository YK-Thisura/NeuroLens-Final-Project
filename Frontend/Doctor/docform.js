const doctorForm = document.querySelector("#doctorForm");

doctorForm.addEventListener("submit", async function (event) {
  event.preventDefault(); // Prevent default form submission

  const formData = new FormData(this); // Capture form data
  try {
    const response = await fetch("http://127.0.0.1:5000/save_doctor", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log(result);

    if (response.ok) {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Doctor profile saved successfully!",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        // Redirect to doctor dashboard after clicking "OK"
        window.location.href = "../Doctor/docdashboard.html";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: result.error || "An unexpected error occurred.",
        confirmButtonColor: "#d33",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: "error",
      title: "Error!",
      text: "An error occurred. Please try again.",
      confirmButtonColor: "#d33",
    });
  }
});
