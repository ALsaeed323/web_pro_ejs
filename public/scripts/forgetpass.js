const forgotHandler = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    const email = document.getElementById('forgetEmail').value;
    const data = {
      email: email,
    };
    try {
      const response = await fetch("/user/forgetpass", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.status === 200) {
        window.location.href = "/signin";
      } else {
        const errorData = await response.json();
        document.getElementById('emailError').textContent = 'Please enter an email address.';
        console.error(errorData.message);
      }
    } catch (error) {
      // Handle network errors or exceptions
      console.error(error);
    }
  };
  