const deleteProductHandler = async (id) => {
  await fetch(`/admin/product/${id}/image`, {
    method: "DELETE",
  });
    const resposnce = await fetch(`/admin/product/${id}`, {
      method: "DELETE",
    });
    if (resposnce.status === 200) {
      window.location.reload();
    }
    else {
      alert("Something went wrong");
    }
  };
