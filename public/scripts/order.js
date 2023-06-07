const payOrder = async (id) => {
    const resposnce = await fetch(`/admin/order/${id}/pay`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (resposnce.status === 200) {
      window.location.reload();
    }
  }
  
  const deliverOrder = async (id) => {
    const resposnce = await fetch(`/admin/order/${id}/deliver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (resposnce.status === 200) {
      window.location.reload();
    }
  }
  