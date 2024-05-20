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
    localStorage.setItem('imlazy', id)

    // Fetch the current data for the item (optional, can skip if not needed)
    const response = await fetch(`/api/bucket/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const itemData = await response.json();
      console.log(itemData);
      // Populate form fields with current data
      document.querySelector("#update-bucketlistitem-item").value =
        itemData.item;
      document.querySelector("#update-bucketlistitem-category").value =
        itemData.category;
      document.querySelector("#update-bucketlistitem-desc").value =
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
 const id = localStorage.getItem('imlazy')
  
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

document.querySelector(".delete").addEventListener("click", delButtonHandler);


 const updateItem = document
   .querySelectorAll(".update");

   for (let i = 0; i < updateItem.length; i++) {
       updateItem[i].addEventListener("click",  updateButtonHandler);
   }

document
  .querySelector("#update-form")
  .addEventListener("submit", updateFormHandler);

  // .addEventListener("click", updateButtonHandler);