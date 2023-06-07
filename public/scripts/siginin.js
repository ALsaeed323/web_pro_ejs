const signinHandler = async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('signinEmail');
    const passwordInput = document.getElementById('signinPassword');
    const email = emailInput.value;
    const password = passwordInput.value;
    const response = await fetch('/user/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    var emailErrorMessage = document.getElementById('emailErrorMessage');
    var passwordErrorMessage = document.getElementById('passwordErrorMessage');
    if (passwordInput.value !== password) {
      passwordErrorMessage.textContent = 'You have entered an invalid password';
      passwordInput.focus();
      return;
    } else if (emailInput.value !== email) {
      emailErrorMessage.textContent = 'You have entered an invalid email';
      emailInput.focus();
      return;
    }

    if (response.status === 200) {
      window.location.href = '/';
    } else {
      const data = await response.json(); // Extract the response body
      console.log(data);
      if (data.errorType === 'email') {
        emailErrorMessage.textContent = 'Invalid email';
        emailInput.focus();
      } else {
        passwordErrorMessage.textContent = 'Invalid password';
        passwordInput.focus();
      }
    }
  };
  