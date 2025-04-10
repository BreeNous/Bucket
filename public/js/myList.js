
let pendingImageAction = null;
let pendingImageFile = null;
let pendingImagePreviewUrl = null; // ✅ To track object URL for cleanup
let pendingImageDelete = false; // 🚨 New variable for tracking delete action


document.addEventListener("DOMContentLoaded", async function () {
  console.log("✅ DOM loaded");

  const dropdownElems = document.querySelectorAll(".dropdown-trigger");
  M.Dropdown.init(dropdownElems, { constrainWidth: false });

  const response = await fetch(`/api/bucket`, {
    method: 'GET',
    credentials: 'include' // Include session cookie
  });
  if (response.ok) {
    const bucketListItems = await response.json();
    bucketListItems.forEach((item) => {
      const imageContainer = document.querySelector(`#image-container-${item.id}`);
      const uploadButton = document.querySelector(`.upload-button[data-id="${item.id}"]`);
      if (item.image) {
        imageContainer.innerHTML = `
          <img src="/api/bucket/${item.id}/image?timestamp=${Date.now()}" alt="Bucket List Image" class="idea-image">
          <img src="/api/bucket/${item.id}/image?timestamp=${Date.now()}" alt="" aria-hidden="true" class="image-image-bg">
          `;
        uploadButton.classList.add("hidden");
      } else {
        uploadButton.classList.remove("hidden");
      }
    });
  }
});

// ✅ Handle first time image upload
document.addEventListener("change", async (event) => {
  if (event.target.classList.contains("image-upload-input")) {
    const id = event.target.dataset.id;
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    const response = await fetch(`/api/bucket/${id}/upload`, {
      method: "POST",
      body: formData,
      credentials: 'include'
    });
    if (response.ok) {
      const imageContainer = document.querySelector(`#image-container-${id}`);
      const src = `/api/bucket/${id}/image?timestamp=${Date.now()}`;
      imageContainer.innerHTML = `
        <img src="${src}" alt="Bucket List Image" class="idea-image">
        <img src="${src}" alt="" aria-hidden="true" class="idea-image-bg">
      `;

      document.querySelector(`.upload-button[data-id="${id}"]`).classList.add("hidden");
    }
  }
});

// ✅ Clicking "Upload" button opens input
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("upload-button")) {
    document.querySelector(`.image-upload-input[data-id="${event.target.dataset.id}"]`).click();
  }
});

// ✅ Open modal and fill data
document.addEventListener("click", function (event) {
  const updateButton = event.target.closest(".update");
  if (updateButton) {
    pendingImageAction = null;
    pendingImageFile = null;

    // ✅ Revoke old preview URL if exists
    if (pendingImagePreviewUrl) {
      URL.revokeObjectURL(pendingImagePreviewUrl);
      pendingImagePreviewUrl = null;
    }

    // ✅ Reset file input value to empty for consistent re-triggering
    const fileInput = document.querySelector("#update-image-input");
    if (fileInput) fileInput.value = "";

    // ✅ Your existing code to fetch item data and populate modal
    const id = updateButton.getAttribute("data-id");
    console.log("Opening modal for ID:", id);

    // ✅ Store correct ID for later
    document.querySelector("#update-image-input").setAttribute("data-id", id);
    document.querySelector(".delete-image-button").setAttribute("data-id", id);

    fetch(`/api/bucket/${id}`, {
      credentials: 'include'
    })
      .then((response) => response.json())
      .then((itemData) => {
        console.log("Item data fetched:", itemData);

        const itemInput = document.querySelector("#update-bucketlistitem-item");
        const descInput = document.querySelector("#update-bucketlistitem-desc");
        const imagePreview = document.querySelector("#update-image-preview");
        const replaceButton = document.querySelector("#update-image-button");
        const deleteButton = document.querySelector(".delete-image-button");

        if (itemInput) itemInput.value = itemData.item;
        if (descInput) descInput.value = itemData.description;

        ['update-bucketlistitem-item', 'update-bucketlistitem-desc'].forEach((id) => {
          document.querySelector(`label[for="${id}"]`)?.classList.add('active');
        });

        if (itemData.image) {
          const imageUrl = `/api/bucket/${id}/image?timestamp=${new Date().getTime()}`;
          imagePreview.src = imageUrl;
          imagePreview.style.display = "block";
          replaceButton.style.display = "inline-block";
          deleteButton.style.display = "inline-block";
        } else {
          imagePreview.style.display = "none";
          replaceButton.style.display = "none";
          deleteButton.style.display = "none";
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching item data:", err);
      });
  }
});


// ✅ Replace image click
document.querySelector("#update-image-button").addEventListener("click", () => {
  const fileInput = document.querySelector("#update-image-input");
  if (fileInput) fileInput.click();
});

document.querySelector("#update-image-input").addEventListener("change", (event) => {
  const file = event.target.files[0];
  const preview = document.querySelector("#update-image-preview");

  if (file) {
    // ✅ If there's an old object URL, revoke it before creating a new one
    if (pendingImagePreviewUrl) {
      URL.revokeObjectURL(pendingImagePreviewUrl);
    }

    pendingImageAction = 'replace';
    pendingImageFile = file;

    // ✅ Create and store new object URL for preview
    pendingImagePreviewUrl = URL.createObjectURL(file);

    // ✅ Display new image preview
    preview.src = pendingImagePreviewUrl;
    preview.style.display = "block";

    // ✅ Show delete button since an image is now present
    document.querySelector(".delete-image-button").style.display = "inline-block";
  }
});

// ✅ Handle Delete Image (but only temporarily mark it until Save is pressed)
document.addEventListener("click", (event) => {
  if (event.target.classList.contains("delete-image-button")) {
    console.log("🗑️ Image marked for deletion, awaiting Save confirmation.");
    pendingImageDelete = true; // ✅ Mark image for deletion

    // ✅ Remove preview from modal
    const imagePreview = document.querySelector("#update-image-preview");
    if (imagePreview) {
      imagePreview.src = "";
      imagePreview.style.display = "none";
    }

    // ✅ Also hide delete button itself
    event.target.style.display = "none";

    // ✅ Optionally also hide replace button (optional, if you want)
    const replaceButton = document.querySelector("#update-image-button");
    if (replaceButton) replaceButton.style.display = "none";
  }
});


// ✅ Checkbox completion update
document.addEventListener("change", async (event) => {
  if (event.target.classList.contains("completed-checkbox")) {
    const id = event.target.dataset.id;
    const completed = event.target.checked;
    await fetch(`/api/bucket/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
      credentials: 'include'
    });
  }
});

// ✅ Handle item update via modal
document.querySelector("#update-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const id = document.querySelector("#update-image-input").getAttribute("data-id");
  const updatedItem = document.querySelector("#update-bucketlistitem-item").value.trim();
  const updatedDescription = document.querySelector("#update-bucketlistitem-desc").value.trim();

  if (!id || !updatedItem || !updatedDescription) return;

  console.log(`🔥 Submitting form for item ID: ${id}`);

  // ✅ First, update title and description
  const response = await fetch(`/api/bucket/${id}`, {
    method: "PUT",
    body: JSON.stringify({ item: updatedItem, description: updatedDescription }),
    headers: { "Content-Type": "application/json" },
    credentials: 'include'
  });

  if (response.ok) {
    console.log("✅ Successfully updated bucket list item.");

    // ✅ Now if there is a pending image to upload, do that too
    if (pendingImageFile) {
      console.log("📤 Uploading pending image file...");

      const formData = new FormData();
      formData.append("image", pendingImageFile);

      const uploadResponse = await fetch(`/api/bucket/${id}/upload`, {
        method: "POST",
        body: formData,
        credentials: 'include'
      });

      if (uploadResponse.ok) {
        console.log("✅ Image uploaded successfully.");
      } else {
        console.error("❌ Failed to upload image.");
        alert("Failed to upload image.");
      }
    }

    // ✅ Handle pending image deletion
    if (pendingImageDelete) {
      console.log("🗑️ Proceeding with image deletion on save...");

      const deleteResponse = await fetch(`/api/bucket/${id}/image`, {
        method: "DELETE",
        credentials: 'include'
      });

      if (deleteResponse.ok) {
        console.log("✅ Image deleted successfully on save.");

        // ✅ Update the main myList page dynamically to reflect removal
        const myListImageContainer = document.querySelector(`#image-container-${id}`);
        const myListUploadButton = document.querySelector(`.upload-button[data-id="${id}"]`);

        if (myListImageContainer) {
          myListImageContainer.innerHTML = `<p id="no-image-text-${id}">No image uploaded yet.</p>`;
        }

        if (myListUploadButton) myListUploadButton.classList.remove("hidden"); // ✅ Show upload button again

      } else {
        console.error("❌ Failed to delete image on save.");
        alert("Failed to delete image.");
      }
    }

    // ✅ Refresh main page image and upload button dynamically
    fetch(`/api/bucket/${id}`, {
      credentials: 'include'
    })
      .then((res) => res.json())
      .then((updatedData) => {
        const imageContainer = document.querySelector(`#image-container-${id}`);
        const uploadButton = document.querySelector(`.upload-button[data-id="${id}"]`);

        if (updatedData.image) {
          // ✅ If image now exists, show it and hide upload button
          const timestamp = Date.now();
          const imgSrc = `/api/bucket/${id}/image?timestamp=${timestamp}`;

          const mainImg = new Image();
          mainImg.src = imgSrc;
          mainImg.alt = "Bucket List Image";
          mainImg.className = "idea-image";

          mainImg.onload = () => {
            const bgImg = document.createElement("img");
            bgImg.src = imgSrc;
            bgImg.alt = "";
            bgImg.setAttribute("aria-hidden", "true");
            bgImg.className = "idea-image-bg";

            // Clear container and append both images
            imageContainer.innerHTML = "";
            imageContainer.appendChild(mainImg);
            imageContainer.appendChild(bgImg);
          };

          uploadButton.classList.add("hidden");

        } else {
          // ❌ If image doesn't exist, show "no image" text and upload button
          if (imageContainer) {
            imageContainer.innerHTML = `
              <p id="no-image-text-${id}" class="grey-text text-darken-1 idea-image"
                 style="width: 100%; height: 100%; border-style: dashed; display: flex; flex-direction: column; justify-content: center; align-items: center; margin: 0;">
                Click the 
                <span style="display: block;"><i class="fa-solid fa-image"></i> icon</span>
                to add a pic!
              </p>
            `;
          }

          uploadButton.classList.remove("hidden");

        }
      });

    // ✅ Close Modal After Updating
    setTimeout(() => {
      const modalInstance = M.Modal.getInstance(document.querySelector("#update-modal"));
      modalInstance.close();
    }, 200);

    // ✅ Cleanup pending variables
    pendingImageAction = null;
    pendingImageFile = null;
    pendingImageDelete = false;
    if (pendingImagePreviewUrl) {
      URL.revokeObjectURL(pendingImagePreviewUrl);
      pendingImagePreviewUrl = null;
    }
  } else {
    alert("❌ Failed to update item.");
  }
});

// ✅ Delete item
document.addEventListener("click", async (event) => {
  if (event.target.closest(".delete")) {
    const id = event.target.closest(".delete").dataset.id;
    const response = await fetch(`/api/bucket/${id}`, {
      method: "DELETE",
      credentials: 'include'
    });
    if (response.ok) location.reload();
  }
});

// ✅ Add new item
document.querySelector(".new-project-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const item = document.querySelector("#bucketlistitem-item").value.trim();
  const desc = document.querySelector("#bucketlistitem-desc").value.trim();
  const response = await fetch(`/api/bucket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item, description: desc }),
    credentials: 'include'
  });
  if (response.ok) location.reload();
});

// ✅ Open Delete Account Modal
document.querySelector('#delete-account-btn').addEventListener('click', () => {
  const modalInstance = M.Modal.getInstance(document.querySelector('#deleteAccountModal'));
  modalInstance.open();
});

// ✅ Logout & delete account
document.querySelector("#logout-btn").addEventListener("click", async () => {
  await fetch('/api/users/logout', {
    method: 'POST',
    credentials: 'include'
  });
  location.replace('/');
});
document.querySelector("#confirm-delete-account").addEventListener("click", async () => {
  await fetch('/api/users/delete-account', {
    method: 'DELETE',
    credentials: 'include'
  });
  location.replace('/');
});



