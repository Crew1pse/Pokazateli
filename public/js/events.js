const eventsList = document.getElementById('eventsList');
const addEventBtn = document.getElementById('addEventBtn');

addEventBtn.addEventListener('click', async () => {
    const name = document.getElementById('eventName').value.trim();
    const category = document.getElementById('eventCategory').value.trim();
    const points = document.getElementById('eventPoints').value.trim();

    if (!name || !category || !points) {
        alert('Заполните все поля');
        return;
    }

    try {
        const response = await fetch('/admin/add-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, category, points: Number(points) })
        });

        if (response.ok) {
            const result = await response.json();
            
            const newElement = createEventElement(result);
            eventsList.prepend(newElement);

            document.getElementById('eventName').value = '';
            document.getElementById('eventPoints').value = '';
            document.getElementById('eventCategory').value = '';
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось связаться с сервером');
    }
});

eventsList.addEventListener('click', async (e) => {
    const deleteBtn = e.target.closest('.delete');
    if (!deleteBtn) return;

    const eventItem = deleteBtn.closest('.events_box_list_action');
    const eventId = deleteBtn.getAttribute('data-id');

    if (confirm('Удалить мероприятие из базы?')) {
        try {
            const response = await fetch(`/admin/delete-event/${eventId}`, { method: 'DELETE' });
            if (response.ok) {
                eventItem.remove();
            } else {
                alert('Не удалось удалить мероприятие из базы');
            }
        } catch (err) {
            console.error(err);
        }
    }
});

function createEventElement({ _id, name, category, points }) {
    const wrapper = document.createElement('div');
    wrapper.className = 'events_box_list_action';

    wrapper.innerHTML = `
    <div class="list_box">
      <div class="list_box_heading">
        <p class="list_box_heading_name">${name}</p>
        <p class="list_box_heading_name slim">${category}</p>
        <p class="list_box_heading_name slim">${points} б.</p>
      </div>
      <div class="list_box_btn">
        <button class="container_gram_btn delete" data-id="${_id}">Удалить</button>
      </div>
    </div>
  `;
    return wrapper;
}