document.addEventListener("DOMContentLoaded", async function () {
  console.log("✅ DOM fully loaded, initializing modals and checking images...");

  // Initialize Materialize modals
  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals);

  // Fetch all bucket list items from the API
  const response = await fetch(`/api/bucket`);
  if (response.ok) {
    const bucketListItems = await response.json();

    // Loop over each bucket list item to display its image or show the upload button
    bucketListItems.forEach((item) => {
      const uploadButton = document.querySelector(`.upload-button[data-id="${item.id}"]`);
      const imageContainer = document.querySelector(`#image-container-${item.id}`);

      if (item.image) {
        // Hide Upload Button and show the image
        if (uploadButton) uploadButton.style.display = "none";
        if (imageContainer) {
          imageContainer.innerHTML = `<img src="/api/bucket/${item.id}/image?timestamp=${new Date().getTime()}" alt="Bucket List Image" style="max-width: 150px; height: auto;">`;
        }
      } else {
        // Show Upload Button if no image is found
        if (uploadButton) uploadButton.style.display = "block";
      }
    });

  } else {
    console.error("❌ Failed to fetch bucket list items.");
  }

  // Event listener for opening the edit modal and displaying existing data
  document.addEventListener("click", function (event) {
    const updateButton = event.target.closest(".update");
    if (updateButton) {
      const id = updateButton.getAttribute("data-id");
      console.log("Opening modal for ID:", id);

      // ✅ Store correct ID in modal's input field for later reference
      document.querySelector("#update-image-input").setAttribute("data-id", id);

      // Fetch and populate modal with the item's data
      fetch(`/api/bucket/${id}`)
        .then((response) => response.json())
        .then((itemData) => {
          console.log("Item data fetched:", itemData);
          const itemInput = document.querySelector("#update-bucketlistitem-item");
          const categoryInput = document.querySelector("#update-bucketlistitem-category");
          const descInput = document.querySelector("#update-bucketlistitem-desc");
          const imageContainer = document.querySelector("#update-image-container");
          const uploadButton = document.querySelector("#update-image-button");

          // Populate fields with item data
          if (itemInput) itemInput.value = itemData.item;
          if (categoryInput) categoryInput.value = itemData.category;
          if (descInput) descInput.value = itemData.description;

          // Fix label positioning
          ['update-bucketlistitem-item', 'update-bucketlistitem-category', 'update-bucketlistitem-desc'].forEach((id) => {
            document.querySelector(`label[for="${id}"]`)?.classList.add('active');
          });


          // Display image or placeholder in modal
          if (itemData.image) {
            const imageUrl = `/api/bucket/${id}/image?timestamp=${new Date().getTime()}`;
            imageContainer.innerHTML = `
              <img id="update-image-preview" src="${imageUrl}" alt="Bucket List Image" style="max-width: 150px; height: auto;">
              <button type="button" class="waves-effect waves-light btn red darken-3 white-text delete-image-button" data-id="${id}">Delete Image</button>
            `;
            uploadButton.style.display = "block";
          } else {
            imageContainer.innerHTML = `<p>No image uploaded yet.</p>`;
            uploadButton.style.display = "none";
          }
        })
        .catch((err) => {
          console.error("Error fetching item data:", err);
        });
    }

    // ✅ Listen for Replace Image Button Click
    const replaceImageButton = document.querySelector("#update-image-button");
    if (replaceImageButton) {
      replaceImageButton.addEventListener("click", () => {
        console.log("🖼️ Replace Image button clicked!");
        const fileInput = document.querySelector("#update-image-input");
        if (fileInput) {
          fileInput.click(); // ✅ Opens the file selection dialog
        } else {
          console.error("❌ Error: File input not found.");
        }
      });
    }
  });



});

// ✅ Listen for Image File Selection (Triggers Upload)
document.addEventListener("change", async (event) => {
  if (event.target.classList.contains("image-upload-input")) {
    const id = event.target.getAttribute("data-id"); // Get bucket list item ID
    const file = event.target.files[0];

    if (!file) {
      console.log("❌ No file selected.");
      return;
    }

    console.log(`📤 Uploading image for bucket list item ID: ${id}`);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`/api/bucket/${id}/upload`, {
        method: "POST",
        body: formData,
      });

      console.log(`📡 Upload request sent. Status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Upload successful! Response:", data);

        // ✅ Find Image Container and Upload Button
        const imageContainer = document.querySelector(`#image-container-${id}`);
        const uploadButton = document.querySelector(`.upload-button[data-id="${id}"]`);

        // ✅ Update UI with Uploaded Image
        if (imageContainer) {
          imageContainer.innerHTML = `
            <img src="/api/bucket/${id}/image?timestamp=${new Date().getTime()}" 
              alt="Bucket List Image" style="max-width: 150px; height: auto;">
          `;
          console.log(`✅ Image updated in container for item ID: ${id}`);
        } else {
          console.error(`❌ Image container not found for ID: ${id}`);
        }

        // ✅ Hide the Upload Button if it exists
        if (uploadButton) {
          uploadButton.style.display = "none";
          console.log(`✅ Upload button hidden for item ID: ${id}`);
        } else {
          console.error(`❌ Upload button not found for ID: ${id}`);
        }
      } else {
        console.error("❌ Upload failed. Response:", await response.text());
      }
    } catch (error) {
      console.error("❌ Error during upload request:", error);
    }
  }
});



// Replace Image Button Click: Triggers file input
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("upload-button")) {
    const id = event.target.getAttribute("data-id");
    const fileInput = document.querySelector(`.image-upload-input[data-id="${id}"]`);

    if (fileInput) {
      fileInput.click(); // ✅ Open file browser for the correct input
    } else {
      console.error(`❌ No file input found for bucket list item ID ${id}`);
    }
  }
});

// Handle image selection for replacing image
document.querySelector("#update-image-input").addEventListener("change", async (event) => {
  const id = document.querySelector("#update-image-input").getAttribute("data-id");
  const file = event.target.files[0];

  if (!id) {
    console.error("❌ Error: No ID found when attempting to upload image.");
    return;
  }

  if (!file) {
    console.log("No image selected.");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  try {
    console.log(`📤 Uploading new image for bucket list item ID: ${id}`);
    const response = await fetch(`/api/bucket/${id}/upload`, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Image uploaded successfully:", data);

      // ✅ Update the image preview in the modal
      const imageContainer = document.querySelector("#update-image-container");
      imageContainer.innerHTML = `
          <img id="update-image-preview" src="/api/bucket/${id}/image?timestamp=${new Date().getTime()}" 
            alt="Bucket List Image" style="max-width: 150px; height: auto;">
          <button type="button" class="waves-effect waves-light btn red darken-3 white-text delete-image-button"
            data-id="${id}">
            Delete Image
          </button>
        `;

      // ✅ Reset the file input field to avoid conflicts on next upload
      event.target.value = ""; // ✅ Clears the previous file selection

    } else {
      alert("❌ Failed to upload new image.");
    }
  } catch (error) {
    console.error("❌ Error uploading image:", error);
  }
});



// ✅ Listen for Delete Button Clicks
document.addEventListener("click", async (event) => {
  if (event.target.closest(".delete")) {
    const id = event.target.closest(".delete").getAttribute("data-id");

    try {
      const response = await fetch(`/api/bucket/${id}`, { method: "DELETE" });

      if (response.ok) {
        console.log(`✅ Successfully deleted item ID: ${id}`);

        // ✅ Find the item's row & remove it
        const itemRow = document.querySelector(`[data-id="${id}"]`)?.closest(".row");
        if (itemRow) {
          const nextElement = itemRow.nextElementSibling; // ✅ Get the next sibling

          itemRow.remove(); // ✅ Remove the item itself
          console.log(`🗑️ Removed item row for ID: ${id}`);

          // ✅ Remove <hr> if it's the next element
          if (nextElement && nextElement.tagName === "HR") {
            nextElement.remove();
            console.log(`🗑️ Removed <hr> separator after ID: ${id}`);
          }
        }
      } else {
        console.error("❌ Failed to delete item.");
        alert("Failed to delete item");
      }
    } catch (error) {
      console.error("❌ Error deleting item:", error);
    }
  }
});


// Event listener for adding a new item
document.querySelector(".new-project-form").addEventListener("submit", async (event) => {
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
});

// ✅ Handle form submission to update item details (title, category, description, and image)
document.querySelector("#update-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.querySelector("#update-image-input").getAttribute("data-id");
  const updatedItem = document.querySelector("#update-bucketlistitem-item").value.trim();
  const updatedCategory = document.querySelector("#update-bucketlistitem-category").value.trim();
  const updatedDescription = document.querySelector("#update-bucketlistitem-desc").value.trim();

  if (!id || !updatedItem || !updatedCategory || !updatedDescription) return;

  console.log(`🔥 Submitting form for item ID: ${id}`);

  const response = await fetch(`/api/bucket/${id}`, {
    method: "PUT",
    body: JSON.stringify({ item: updatedItem, category: updatedCategory, description: updatedDescription }),
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    console.log("✅ Successfully updated bucket list item.");

    // ✅ Get the correct row for the updated item
    const updatedElement = document.querySelector(`.update[data-id="${id}"]`)?.closest(".row");

    if (updatedElement) {
      // ✅ Update text content safely (check if elements exist first)
      const titleElement = updatedElement.querySelector("h4");
      if (titleElement) titleElement.textContent = updatedItem;

      const categoryElement = updatedElement.querySelector(".bucket-category");
      if (categoryElement) categoryElement.textContent = `Category: ${updatedCategory}`;

      const descriptionElement = updatedElement.querySelector(".bucket-description");
      if (descriptionElement) descriptionElement.textContent = `Description: ${updatedDescription}`;
    }

    // ✅ Fetch updated item details to check image status
    fetch(`/api/bucket/${id}`)
      .then((res) => res.json())
      .then((updatedData) => {
        const imageContainer = document.querySelector(`#image-container-${id}`);
        const uploadButton = document.querySelector(`.upload-button[data-id="${id}"]`);
        const modalReplaceButton = document.querySelector("#update-image-button"); // "Replace Image" button in modal

        if (updatedData.image) {
          // ✅ If image exists, show it on the main page
          if (imageContainer) {
            imageContainer.innerHTML = `
              <img src="/api/bucket/${id}/image?timestamp=${new Date().getTime()}" 
                alt="Bucket List Image" style="max-width: 150px; height: auto;">
            `;
          }
          if (uploadButton) uploadButton.style.display = "none"; // Hide Upload Button
          if (modalReplaceButton) modalReplaceButton.style.display = "block"; // Show "Replace Image"
        } else {
          // ❌ No image → Show "No image uploaded yet" & Upload Button immediately
          if (imageContainer) imageContainer.innerHTML = `<p>No image uploaded yet.</p>`;
          if (uploadButton) uploadButton.style.display = "block"; // ✅ Show Upload Button Immediately
          if (modalReplaceButton) modalReplaceButton.style.display = "none"; // ✅ Hide "Replace Image" button
        }
      });

    // ✅ Close Modal After Updating
    setTimeout(() => {
      const modalInstance = M.Modal.getInstance(document.querySelector("#update-modal"));
      modalInstance.close();
    }, 200);
  } else {
    alert("❌ Failed to update item.");
  }
});

// ✅ Listen for Delete Image Button Clicks
document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("delete-image-button")) {
    const id = event.target.getAttribute("data-id");

    console.log(`🗑️ Deleting image for bucket list item ID: ${id}`);

    try {
      const response = await fetch(`/api/bucket/${id}/image`, { method: "DELETE" });

      if (response.ok) {
        console.log("✅ Image deleted successfully!");

        // ✅ Remove the image preview from the modal
        const imageContainer = document.querySelector("#update-image-container");
        if (imageContainer) {
          imageContainer.innerHTML = `<p>No image uploaded yet.</p>`;
        }

        setTimeout(() => {
          event.target.style.display = "none";
        }, 300);


        // ✅ Hide the delete button
        event.target.style.display = "none";

        // ✅ Ensure the upload button is visible again
        const uploadButton = document.querySelector("#update-image-button");
        if (uploadButton) {
          uploadButton.style.display = "block";
        }

        // ✅ Update main profile page dynamically to reflect the image removal
        const profileImageContainer = document.querySelector(`#image-container-${id}`);
        if (profileImageContainer) {
          profileImageContainer.innerHTML = `<p id="no-image-text-${id}">No image uploaded yet.</p>`;
        }
      } else {
        console.error("❌ Failed to delete image.");
        alert("Failed to delete image.");
      }
    } catch (error) {
      console.error("❌ Error deleting image:", error);
    }
  }
});

// ✅ Listen for "Completed" checkbox changes & save them
document.addEventListener("change", async (event) => {
  if (event.target.classList.contains("completed-checkbox")) {
    const id = event.target.getAttribute("data-id");
    const isChecked = event.target.checked;

    console.log(`🔄 Updating completed status for ID ${id} to: ${isChecked}`);

    try {
      const response = await fetch(`/api/bucket/${id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: isChecked }), // ✅ Save to DB
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        console.log("✅ Completed status updated successfully.");
      } else {
        console.error("❌ Failed to update completed status.");
      }
    } catch (error) {
      console.error("❌ Error updating completed status:", error);
    }
  }
});









