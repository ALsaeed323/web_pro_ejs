const shippingHandler = async (e) => {
    e.preventDefault();
    const data = {
      fullName: document.getElementById("shippingFullName").value,
      address: document.getElementById("shippingAddress").value,
      city: document.getElementById("shippingCity").value,
      postalCode: document.getElementById("shippingPostalCode").value,
      country: document.getElementById("shippingCountry").value,
    };
    const resposnce = await fetch("/user/shipping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    redirect("/payment");
  };
  