//all needs to be refactored for our app!!!

const newFormHandler = async (event) => {
  event.preventDefault();

  const item = document.querySelector("#bucketlistitem-item").value.trim();
  const category = document
    .querySelector("#bucketlistitem-category")
    .value.trim();
  const description = document
    .querySelector("#bucketlistitem-desc")
    .value.trim();

  if (item && category && description) {
    const response = await fetch(`/api/bucket`, {
      method: "POST",
      body: JSON.stringify({ item, category, description }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      document.location.replace("/profile");
    } else {
      alert("Failed to create project");
    }
  }
};

const updateButtonHandler = async (event) => {
  if (event.target.hasAttribute("data-id")) {
    const id = event.target.getAttribute("data-id");

    // Fetch the current data for the item (optional, can skip if not needed)
    const response = await fetch(`/api/bucket/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const itemData = await response.json();
      
      // Populate form fields with current data
      document.querySelector("#update-bucketlistitem-item").textContent =
        itemData.item;
      document.querySelector("#update-bucketlistitem-category").textContent =
        itemData.category;
      document.querySelector("#update-bucketlistitem-desc").textContent =
        itemData.description;
        document.querySelector('#update-form').style.display = 'block'
    } else {
      alert("Failed to fetch item data");
    }
  }
};

// function to update bucketlist item
const updateFormHandler = async (event) => {
   event.preventDefault();

  const id = document.querySelector("#update-item-id").value.trim();
  const updatedItem = document
    .querySelector("#update-bucketlistitem-item")
    .value.trim();
  const updatedCategory = document
    .querySelector("#update-bucketlistitem-category")
    .value.trim();
  const updatedDescription = document
    .querySelector("#update-bucketlistitem-desc")
    .value.trim();

    console.log("************************")
    console.log(id, updatedItem, updatedCategory, updatedDescription)

  if (updatedItem && updatedCategory && updatedDescription) {
    const response = await fetch(`/api/bucket/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        item: updatedItem,
        category: updatedCategory,
        description: updatedDescription,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      document.location.replace("/profile");
      console.log("***************** did the thing")
    } else {
      alert("Failed to update project");
    }
  }
};

// function to delete bucketlist item
const delButtonHandler = async (event) => {
  if (event.target.hasAttribute("data-id")) {
    const id = event.target.getAttribute("data-id");

    const response = await fetch(`/api/bucket/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      document.location.replace("/profile");
    } else {
      alert("Failed to delete project");
    }
  }
};

// event listeners
document
  .querySelector(".new-project-form")
  .addEventListener("submit", newFormHandler);

document.querySelector("#delete").addEventListener("click", delButtonHandler);

document
  .querySelector("#update")
  .addEventListener("click", updateButtonHandler);
