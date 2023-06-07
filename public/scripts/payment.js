const paymentHandler = async (e) => {
    e.preventDefault();
    const data = {
      paymentMethod: document.getElementById("paymentForm").paymentMethod.value,
    };
    const resposnce = await fetch("/user/payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),


    });
    if (resposnce.status === 200) {
      redirect("/placeorder");
    } 
  };
  