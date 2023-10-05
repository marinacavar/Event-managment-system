let formData = [];

async function getFormData() {
  const response = await fetch('http://localhost:3000/formData');
  formData = await response.json();
  const venueSelectElement = document.getElementById('venueSelect');
  const organizatorSelectElement = document.getElementById('organizatorSelect');

  formData.venues.forEach((venue) => {
    const optionElement = document.createElement('option');
    optionElement.value = venue._id;
    optionElement.textContent = `${venue.name} - ${venue.city.name}`;
    venueSelectElement.appendChild(optionElement);
  });

  formData.organizators.forEach((organizator) => {
    const optionElement = document.createElement('option');
    optionElement.value = organizator._id;
    optionElement.textContent = `${organizator.name} (${organizator.email})`;
    organizatorSelectElement.appendChild(optionElement);
  });
}

getFormData();

let selectedId;
const addEventButton = document.getElementById('add-event-button');
const addEventForm = document.getElementById('add-event-form');
const nameInput = document.getElementById('name-input');
const descriptionInput = document.getElementById('description-input');
const organizatorsInput = document.getElementById('organizers[]');
const submitButton = document.getElementById('submit-button');
const updateButtonMini = document.getElementById('update-button');
const cancelButton = document.getElementById('cancel-button');

addEventButton.addEventListener('click', () => {
  addEventForm.style.display = 'block';
  submitButton.style.display = 'block';
  updateButtonMini.style.display = 'none';
  addEventForm.reset();
});

cancelButton.addEventListener('click', () => {
  addEventForm.style.display = 'none';
});

addEventForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = document.getElementById('name-input').value;
  const description = document.getElementById('description-input').value;
  const startTime = document.getElementById('startTime-input').value;
  const endTime = document.getElementById('endTime-input').value;
  const venueSelect = document.getElementById('venueSelect');
  const selectedVenue = venueSelect.value;

  const organizatorSelect = document.getElementById('organizatorSelect');
  const selectedOrganizators = Array.from(
    organizatorSelect.selectedOptions
  ).map((option) => option.value);

  if (event.submitter.id === 'submit-button') {
    try {
      const response = await fetch('http://localhost:3000/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          startTime,
          endTime,
          venueId: selectedVenue,
          organizators: selectedOrganizators,
        }),
      });
      const data = await response.json();
      alert(data.message);
      displayEvents();
    } catch (error) {
      console.error(error);
      alert('An error occurred. Please try again.');
    }
  } else if (event.submitter.id === 'update-button') {
    try {
      const response = await fetch(
        `http://localhost:3000/events/${selectedId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            description,
            startTime,
            endTime,
            venueId: selectedVenue,
            organizators: selectedOrganizators,
          }),
        }
      );
      const data = await response.json();

      alert(data.message);
      displayEvents();

      addEventButton.style.display = 'block';
    } catch (error) {
      alert('An error occurred. Please try again.');
      console.error(error);
    }
  }

  addEventForm.reset();
  addEventForm.style.display = 'none';
});

async function fetchEvents() {
  const response = await fetch('http://localhost:3000/events');
  const data = await response.json();
  return data.data;
}

async function displayEvents() {
  const eventsList = document.getElementById('events-list');
  eventsList.innerHTML = '';

  const events = await fetchEvents();
  events.forEach((event) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');

    const descriptionCell = document.createElement('td');
    const descriptionContent = document.createElement('div');
    descriptionContent.style.maxHeight = '120px';
    descriptionContent.style.padding = '15px';

    descriptionContent.style.overflowY = 'auto';
    descriptionCell.appendChild(descriptionContent);

    const timeCell = document.createElement('td');

    const venueCell = document.createElement('td');

    const venueContainer = document.createElement('div');
    venueContainer.style.width = '200px';
    venueContainer.style.display = 'flex';
    venueContainer.style.flexDirection = 'column';
    venueContainer.style.padding = '15px 0px';

    venueCell.appendChild(venueContainer);

    const td1 = document.createElement('td');
    const td2 = document.createElement('td');
    const td3 = document.createElement('td');
    const td4 = document.createElement('td');

    td1.style.padding = '0px';
    td2.style.padding = '0px';
    td3.style.padding = '0px';
    td4.style.padding = '0px';

    td1.innerHTML = event?.venue?.name
      ? `<b>name</b>: ${event?.venue?.name}`
      : '';
    td2.innerHTML = event?.venue?.address
      ? `<b>address</b>: ${event?.venue?.address}`
      : '';
    td3.innerHTML = event?.venue?.city
      ? `<b>city</b>: ${event?.venue?.city?.name}`
      : '';
    td4.innerHTML = event?.venue?.capacity
      ? `<b>capacity</b>: ${event?.venue?.capacity}`
      : '';

    venueContainer.appendChild(td1);
    venueContainer.appendChild(td2);
    venueContainer.appendChild(td3);
    venueContainer.appendChild(td4);

    const organizatorsCell = document.createElement('td');

    if (event.organizators) {
      event.organizators.forEach((organizator) => {
        const container = document.createElement('div');
        organizatorsCell.appendChild(container);

        const td = document.createElement('td');
        td.style.padding = '0px 4px';

        td.innerHTML = `<b>name</b>: ${organizator.name}`;
        container.appendChild(td);

        const td1 = document.createElement('td');
        td1.style.padding = '0px 4px';

        td1.innerHTML = `<b>email</b>: ${organizator.email}`;
        container.appendChild(td1);

        container.style.borderBottom = '1px solid black';
      });
    }

    const updateCell = document.createElement('td');
    const deleteCell = document.createElement('td');

    nameCell.innerText = event.name;
    descriptionContent.innerText = event.description;

    if (event.startTime && !event.endTime) {
      timeCell.innerText = `from ${new Date(
        event.startTime
      ).toLocaleDateString()}`;
    } else if (event.startTime && event.endTime) {
      timeCell.innerText = `from ${new Date(
        event.startTime
      ).toLocaleDateString()} to ${new Date(
        event.endTime
      ).toLocaleDateString()}`;
    }

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    deleteButton.innerText = 'Delete';

    const deletePopup = document.getElementById('deletePopup');
    const confirmButton = document.querySelector('.confirm-button');
    const cancelButton = document.querySelector('.cancel-button');

    let deleteEventId = '';
    deleteButton.addEventListener('click', () => {
      deletePopup.style.display = 'block';

      confirmButton.addEventListener('click', async () => {
        try {
          const response = await fetch(
            `http://localhost:3000/events/${event._id}`,
            {
              method: 'DELETE',
            }
          );
          const data = await response.json();
          displayEvents();
        } catch (error) {
          console.error(error);
          alert('An error occurred. Please try again.');
        }
        deletePopup.style.display = 'none';
      });
    });

    cancelButton.addEventListener('click', () => {
      deletePopup.style.display = 'none';
    });

    deleteCell.appendChild(deleteButton);

    const updateButton = document.createElement('button');
    updateButton.classList.add('update-button');
    updateButton.innerText = 'Update';

    updateButton.addEventListener('click', async () => {
      selectedId = event._id;
      const nameInput = document.getElementById('name-input');
      nameInput.value = event.name;
      const startTimeInput = document.getElementById('startTime-input');
      startTimeInput.value = event.startTime;
      const endTimeInput = document.getElementById('endTime-input');
      endTimeInput.value = event.endTime;
      const descriptionInput = document.getElementById('description-input');
      descriptionInput.value = event.description;

      var venueSelect = document.getElementById('venueSelect');
      var desiredValue = event.venue._id;

      for (var i = 0; i < venueSelect.options.length; i++) {
        var option = venueSelect.options[i];

        if (option.value === desiredValue) {
          option.selected = true;
          break;
        }
      }

      var organizatorSelect = document.getElementById('organizatorSelect');
      let desiredValues = event.organizators.map(
        (organizator) => organizator._id
      );

      for (var i = 0; i < organizatorSelect.options.length; i++) {
        var option = organizatorSelect.options[i];

        if (desiredValues.includes(option.value)) {
          option.selected = true;
        }
      }
    });

    updateCell.appendChild(updateButton);

    const cancelButtonUpdate = document.getElementById('cancel-button');

    cancelButtonUpdate.addEventListener('click', () => {
      addEventButton.innerHTML = 'Add event';
      addEventButton.style.display = 'block';
    });

    updateButton.addEventListener('click', () => {
      addEventButton.style.display = 'block';
      addEventForm.style.display = 'block';
      addEventButton.innerHTML = 'Update event';

      submitButton.style.display = 'none';
      updateButtonMini.style.display = 'block';
    });

    row.appendChild(nameCell);
    row.appendChild(descriptionCell);
    row.appendChild(timeCell);
    row.appendChild(venueCell);
    row.appendChild(organizatorsCell);
    row.appendChild(updateCell);
    row.appendChild(deleteCell);

    eventsList.appendChild(row);
  });
}

displayEvents();
