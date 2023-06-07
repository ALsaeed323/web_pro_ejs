const deleteOrderHandler = async (e, id) => {
    e.preventDefault();
    const resposnce = await fetch(`/admin/order/${id}`, {
      method: "DELETE",
    });
    if (resposnce.status === 200) {
      window.location.reload();
    }
    else {
      alert("Something went wrong");
    }
  };
  