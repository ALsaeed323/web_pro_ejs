const deleteImageHandler = async (e, id) => {
    e.preventDefault();
    const resposnce = await fetch(`/admin/product/${id}/image`, {
      method: "DELETE",
    });
    if (resposnce.status === 200) {
      window.location.reload();
    }
    else {
      alert("Something went wrong");
    }
  };
  
  const uploadPhotoHandler = (e, id) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append('image', e.target.files[0]);
    fetch(`/admin/product/${id}`, {
      method: 'POST',
      body: formData
    })
      .then(response => response.json())
      .then(result => {
        window.location.reload();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  const updateProductHandler = async (e, id) => {
    e.preventDefault();
    const name = document.getElementById("updateProductName").value;
    const slug = document.getElementById("updateProductSlug").value;
    const price = document.getElementById("updateProductPrice").value;
    const brand = document.getElementById("updateProductBrand").value;
    const category = document.getElementById("updateProductCategory").value;
    const countInStock = document.getElementById("updateProductCountInStock").value;
    const description = document.getElementById("updateProductDescription").value;
    const data = { name, price, brand, category, countInStock, description, slug };
    const res = await fetch(`/admin/product/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    console.log(res);
    if (res.status === 200) {
      redirect("/admin/products");
    }
    else {
      alert("Something went wrong");
    }
  }
