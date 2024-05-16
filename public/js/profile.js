//all needs to be refactored for our app!!!

const newFormHandler = async (event) => {
  event.preventDefault();

  const item = document.querySelector('#bucketlistitem-item').value.trim();
  const category = document.querySelector('#bucketlistitem-category').value.trim();
  const description = document.querySelector('#bucketlistitem-desc').value.trim();

  if (item && category && description) {
    const response = await fetch(`/api/bucket`, {
      method: 'POST',
      body: JSON.stringify({ item, category, description }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      document.location.replace('/profile');
    } else {
      alert('Failed to create project');
    }
  }
};


const updateFormHandler = async (event) => {
  event.preventDefault();

  // Get the item ID you want to update
  const id = document.querySelector('#update-item-id').value.trim();

  // Fetch the current data for the item
  const response = await fetch(`/api/bucket/${id}`, {
    method: 'GET',
  });

  if (response.ok) {
    const itemData = await response.json();

    // Populate form fields with current data
    document.querySelector('#update-bucketlistitem-item').value = itemData.item;
    document.querySelector('#update-bucketlistitem-category').value = itemData.category;
    document.querySelector('#update-bucketlistitem-desc').value = itemData.description;

    // Listen for form submission
    const updateForm = document.querySelector('#update-form');
    updateForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const updatedItem = document.querySelector('#update-bucketlistitem-item').value.trim();
      const updatedCategory = document.querySelector('#update-bucketlistitem-category').value.trim();
      const updatedDescription = document.querySelector('#update-bucketlistitem-desc').value.trim();

      if (updatedItem && updatedCategory && updatedDescription) {
        const updateResponse = await fetch(`/api/bucket/${id}`, {
          method: 'PUT',
          body: JSON.stringify({ item: updatedItem, category: updatedCategory, description: updatedDescription }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (updateResponse.ok) {
          document.location.replace('/profile');
        } else {
          alert('Failed to update project');
        }
      }
    });
  } else {
    alert('Failed to fetch item data');
  }
};



const delButtonHandler = async (event) => {
  if (event.target.hasAttribute('data-id')) {
    const id = event.target.getAttribute('data-id');

    const response = await fetch(`/api/bucket/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      document.location.replace('/profile');
    } else {
      alert('Failed to delete project');
    }
  }
};

document
  .querySelector('.new-project-form')
  .addEventListener('submit', newFormHandler);

document
  .querySelector('.project-list')
  .addEventListener('click', delButtonHandler);
