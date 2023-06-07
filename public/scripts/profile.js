const profileHandler = async (e) => {
    e.preventDefault();
    const name = document.getElementById("profileName").value;
    const email = document.getElementById("profileEmail").value;
    const password = document.getElementById("profilePassword").value;
    const confimPassword = document.getElementById("profileConfirmPassword").value;
    if (password !== confimPassword) {
      displayErrorMessage('passwordErrorMessage', 'Password and Confirm Password do not match');
      return;
    }
    const data = { name, email, password };
    const resposnce = await fetch("/user/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    window.location.href = `/`;
  };
 