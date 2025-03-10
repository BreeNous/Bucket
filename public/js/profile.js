document.addEventListener("DOMContentLoaded", async function () {
  console.log("✅ DOM loaded");

  const modals = document.querySelectorAll(".modal");
  M.Modal.init(modals);

  const dropdownElems = document.querySelectorAll(".dropdown-trigger");
  M.Dropdown.init(dropdownElems, { constrainWidth: false });

  const response = await fetch(`/api/bucket`);
  if (response.ok) {
    const bucketListItems = await response.json();
    bucketListItems.forEach((item) => {
      const imageContainer = document.querySelector(`#image-container-${item.id}`);
      const uploadButton = document.querySelector(`.upload-button[data-id="${item.id}"]`);
      if (item.image) {
        imageContainer.innerHTML = `<img src="/api/bucket/${item.id}/image?timestamp=${Date.now()}" alt="Bucket List Image" style="width: auto; max-height: 200px;">`;
        uploadButton.style.display = "none";
      } else {
        uploadButton.style.display = "block";
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
    const response = await fetch(`/api/bucket/${id}/upload`, { method: "POST", body: formData });
    if (response.ok) {
      const imageContainer = document.querySelector(`#image-container-${id}`);
      imageContainer.innerHTML = `<img src="/api/bucket/${id}/image?timestamp=${Date.now()}" style="width: auto; max-height: 200px;">`;
      document.querySelector(`.upload-button[data-id="${id}"]`).style.display = "none";
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
document.addEventListener("click", async (event) => {
  const updateButton = event.target.closest(".update");
  if (updateButton) {
    const id = updateButton.dataset.id;
    const response = await fetch(`/api/bucket/${id}`);
    const item = await response.json();

    document.querySelector("#update-image-input").dataset.id = id;
    document.querySelector(".delete-image-button").dataset.id = id;
    document.querySelector("#update-bucketlistitem-item").value = item.item;
    document.querySelector("#update-bucketlistitem-desc").value = item.description;

    ['update-bucketlistitem-item', 'update-bucketlistitem-desc'].forEach((i) =>
      document.querySelector(`label[for="${i}"]`).classList.add('active')
    );

    const preview = document.querySelector("#update-image-preview");
    const replaceBtn = document.querySelector("#update-image-button");
    const deleteBtn = document.querySelector(".delete-image-button");

    if (item.image) {
      preview.src = `/api/bucket/${id}/image?timestamp=${Date.now()}`;
      preview.style.display = "block";
      replaceBtn.style.display = "inline-block";
      deleteBtn.style.display = "inline-block";
    } else {
      preview.style.display = "none";
      replaceBtn.style.display = "none";
      deleteBtn.style.display = "none";
    }
  }
});

// ✅ Replace image click
document.querySelector("#update-image-button").addEventListener("click", () => {
  document.querySelector("#update-image-input").click();
});

// ✅ Handle image replacement
document.querySelector("#update-image-input").addEventListener("change", async (event) => {
  const id = event.target.dataset.id;
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`/api/bucket/${id}/upload`, { method: "POST", body: formData });
  if (response.ok) {
    const imageURL = `/api/bucket/${id}/image?timestamp=${Date.now()}`;
    document.querySelector("#update-image-preview").src = imageURL;
    document.querySelector("#update-image-preview").style.display = "block";
    document.querySelector(`#image-container-${id}`).innerHTML = `<img src="${imageURL}" style="width: auto; max-height: 200px;">`;
    document.querySelector(`.upload-button[data-id="${id}"]`).style.display = "none";
  }
});

// ✅ Delete image logic
document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("delete-image-button")) {
    const id = event.target.dataset.id;
    const response = await fetch(`/api/bucket/${id}/image`, { method: "DELETE" });
    if (response.ok) {
      document.querySelector("#update-image-preview").style.display = "none";
      document.querySelector(`#image-container-${id}`).innerHTML = `<p>No image uploaded yet.</p>`;
      document.querySelector(`.upload-button[data-id="${id}"]`).style.display = "block";
      event.target.style.display = "none";
    }
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
    });
  }
});

// ✅ Handle item update via modal
document.querySelector("#update-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const id = document.querySelector("#update-image-input").dataset.id;
  const item = document.querySelector("#update-bucketlistitem-item").value.trim();
  const desc = document.querySelector("#update-bucketlistitem-desc").value.trim();

  const response = await fetch(`/api/bucket/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item, description: desc }),
  });
  if (response.ok) location.reload(); // ✅ Simple reload to refresh updated data
});

// ✅ Delete item
document.addEventListener("click", async (event) => {
  if (event.target.closest(".delete")) {
    const id = event.target.closest(".delete").dataset.id;
    const response = await fetch(`/api/bucket/${id}`, { method: "DELETE" });
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
  });
  if (response.ok) location.reload();
});

// ✅ Logout & delete account
document.querySelector("#logout-btn").addEventListener("click", async () => {
  await fetch('/api/users/logout', { method: 'POST' });
  location.replace('/');
});
document.querySelector("#confirm-delete-account").addEventListener("click", async () => {
  await fetch('/api/users/delete-account', { method: 'DELETE' });
  location.replace('/');
});



