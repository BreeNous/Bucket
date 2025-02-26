// Initialize Materialize modals when the page loads
document.addEventListener("DOMContentLoaded", function () {
  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals);
});

// Function to handle adding a new item
const newFormHandler = async (event) => {
  event.preventDefault();

  const item = document.querySelector("#bucketlistitem-item").value.trim();
  const category = document.querySelector("#bucketlistitem-category").value.trim();
  const description = document.querySelector("#bucketlistitem-desc").value.trim();

  if (item && category && description) {
    const response = await fetch(`/api/bucket`, {
      method: "POST",
      body: JSON.stringify({ item, category, description }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      document.location.replace("/profile");
    } else {
      alert("Failed to create item");
    }
  }
};

// Function to handle opening the edit modal & populating fields
const updateButtonHandler = async (event) => {
  if (event.target.closest(".update")) { // Ensure the click is on an update button
    const id = event.target.closest(".update").getAttribute("data-id");
    localStorage.setItem("imlazy", id);

    try {
      const response = await fetch(`/api/bucket/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const itemData = await response.json();
        console.log("Fetched Item Data:", itemData); // Debugging

        // Populate form fields
        document.querySelector("#update-bucketlistitem-item").value = itemData.item;
        document.querySelector("#update-bucketlistitem-category").value = itemData.category;
        document.querySelector("#update-bucketlistitem-desc").value = itemData.description;

        // Ensure labels stay above text fields
        document.querySelector('label[for="update-bucketlistitem-item"]').classList.add("active");
        document.querySelector('label[for="update-bucketlistitem-category"]').classList.add("active");
        document.querySelector('label[for="update-bucketlistitem-desc"]').classList.add("active");

        // Open modal
        const modalInstance = M.Modal.getInstance(document.querySelector("#update-modal"));
        modalInstance.open();
      } else {
        alert("Failed to fetch item data");
      }
    } catch (error) {
      console.error("Error fetching item:", error);
    }
  }
};

// Function to handle updating an item
const updateFormHandler = async (event) => {
  event.preventDefault();
  const id = localStorage.getItem("imlazy");

  const updatedItem = document.querySelector("#update-bucketlistitem-item").value.trim();
  const updatedCategory = document.querySelector("#update-bucketlistitem-category").value.trim();
  const updatedDescription = document.querySelector("#update-bucketlistitem-desc").value.trim();

  if (updatedItem && updatedCategory && updatedDescription) {
    const response = await fetch(`/api/bucket/${id}`, {
      method: "PUT",
      body: JSON.stringify({ item: updatedItem, category: updatedCategory, description: updatedDescription }),
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      // Update the UI dynamically instead of reloading the page
      const updatedElement = document.querySelector(`[data-id="${id}"]`).closest(".row");
      updatedElement.querySelector("h4").textContent = updatedItem;
      updatedElement.querySelector("p:nth-of-type(1)").textContent = `Category: ${updatedCategory}`;
      updatedElement.querySelector("p:nth-of-type(2)").textContent = `Description: ${updatedDescription}`;

      // Close the modal
      const modalInstance = M.Modal.getInstance(document.querySelector("#update-modal"));
      modalInstance.close();
    } else {
      alert("Failed to update item");
    }
  }
};


// Function to handle deleting an item
const delButtonHandler = async (event) => {
  if (event.target.closest(".delete")) {
    const id = event.target.closest(".delete").getAttribute("data-id");

    const response = await fetch(`/api/bucket/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      // Find the item's row and remove it
      const itemRow = document.querySelector(`[data-id="${id}"]`).closest(".row");
      if (itemRow) {
        const nextElement = itemRow.nextElementSibling; // Get the <hr> after the item
        itemRow.remove(); // Remove the item

        // If the next element is an <hr>, remove it too
        if (nextElement && nextElement.tagName === "HR") {
          nextElement.remove();
        }
      }
    } else {
      alert("Failed to delete item");
    }
  }
};

// image uplaoding functionallity
// Image Upload Click Event
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("upload-button")) {
    // Get the bucket list item ID
    const id = event.target.closest(".upload-button")?.getAttribute("data-id");

    if (!id) {
      console.error("❌ Error: No data-id found for upload button.");
      return;
    }

    // Click the corresponding file input
    const fileInput = document.querySelector(`.image-upload-input[data-id="${id}"]`);
    if (fileInput) {
      fileInput.click();
    } else {
      console.error(`❌ Error: No file input found for bucket list item ID ${id}`);
    }
  }
});


document.addEventListener("change", async (event) => {
  if (event.target.classList.contains("image-upload-input")) {
    const id = event.target.getAttribute("data-id");
    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    console.log("Uploading image for bucket list item with ID:", id);
    try {
      const response = await fetch(`/api/bucket/${id}/upload`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Upload successful:", data);

        // Update the image in the UI
        const imageContainer = document.querySelector(`#image-container-${id}`);
        imageContainer.innerHTML = `<img src="${data.imageUrl}" alt="Bucket List Image" style="max-width: 150px; height: auto;">`;
      } else {
        alert("Failed to upload image.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }
});




// Event listener for adding a new item
document.querySelector(".new-project-form").addEventListener("submit", newFormHandler);

// Using event delegation for dynamically loaded elements
document.addEventListener("click", updateButtonHandler);
document.addEventListener("click", delButtonHandler);
document.querySelector("#update-form").addEventListener("submit", updateFormHandler);
