const deleteUserHandler = async (e, id) => {
    e.preventDefault();
    const resposnce = await fetch(`/admin/user/${id}`, {
      method: "DELETE",
    });
    if (resposnce.status === 200) {
      showMessage("User Deleted");
      window.location.reload();
    }
    else {
      showMessage("Something went wrong");

    }
  };
