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


// const updateButtons = document.querySelectorAll('.update-button');
// updateButtons.forEach(button => {
//     button.addEventListener('click', updateButtonHandler);
// });
// function updateButtonHandler(event) {
//     // Retrieve the element to be updated
//     const elementToUpdate = event.target.parentElement;

//     // Update the content or style of the element
//     elementToUpdate.textContent = "Updated content"; // Example update operation

//     // You can perform any other update operations here as needed
// }

// // Example usage:
// const updateButtons = document.querySelectorAll('.update-button');
// updateButtons.forEach(button => {
//     button.addEventListener('click', updateButtonHandler);
// });


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
