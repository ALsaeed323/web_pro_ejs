  async function signupHandler(event) {
    event.preventDefault(); // Prevent form submission

    // Clear previous error messages
    clearErrorMessages();

    // Perform validation
    let nameInput = document.getElementById("signupName");
    let emailInput = document.getElementById("signupEmail");
    let passwordInput = document.getElementById("signupPassword");
    let confirmPasswordInput = document.getElementById("signupConfirmPassword");
    // Validate name
    if (nameInput.value.trim() === "") {
      displayErrorMessage("nameError", "Please enter your name.");
      nameInput.focus();
      return;
    }
    // Validate email
    if (emailInput.value.trim() === "") {
      displayErrorMessage("emailError", "Please enter your email address.");
      emailInput.focus();
      return;
    }
    // Validate password
    if (passwordInput.value === "") {
      displayErrorMessage("passwordError", "Please enter a password.");
      passwordInput.focus();
      return;
    }

    // Validate confirm password
    if (confirmPasswordInput.value === "") {
      displayErrorMessage(
        "confirmPasswordError",
        "Please confirm your password."
      );
      confirmPasswordInput.focus();
      return;
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      displayErrorMessage(
        "confirmPasswordError",
        "Password and confirm password do not match."
      );
      confirmPasswordInput.focus();
      return;
    }
    // If all validations pass, you can proceed with form submission
    // Here, you can send the form data to the server or perform any other desired actions
    const response = await fetch("/user/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name:nameInput.value, email:emailInput.value, password:passwordInput.value }),
    });
    if (response.status === 200) {
    displaySuccessMessage("Form submitted successfully!");
      window.location.href = "/";
    } else if (response.status === 409) {
      displayErrorMessage("emailError", "Email already exist");
    } else {
      const data = await response.json(); // extract the body data
      console.log(data);
      displayErrorMessage("emailError", "something went wrong");
    }
  }

  function  displayErrorMessage(elementId, message) {
    var errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }

  function displaySuccessMessage(message) {
    var successMessage = document.createElement("p");
    successMessage.textContent = message;
    successMessage.classList.add("success-message");

    var form = document.getElementById("signupForm");
    form.appendChild(successMessage);
  }

  function clearErrorMessages() {
    var errorMessages = document.getElementsByClassName("error-message");
    for (var i = 0; i < errorMessages.length; i++) {
      errorMessages[i].style.display = "none";
      errorMessages[i].textContent = "";
    }

    var successMessage = document.querySelector(".success-message");
    if (successMessage) {
      successMessage.remove();
    }
  }
