document
  .getElementById("doctorForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(this); // Create a FormData object from the form

    try {
      const response = await fetch("http://127.0.0.1:5000/save_prescription", {
        method: "POST",
        body: formData, // Send the form data to Flask
      });

      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Prescription details saved successfully!",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to save prescription details.",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        title: "Error!",
        text: "Error submitting form.",
        icon: "error",
        confirmButtonText: "Try Again",
      });
    }
  });
