document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('fileInput');
    const previewList = document.getElementById('previewList');
    const sendBtn = document.querySelector('.container_gram_btn');
    const authBtn = document.querySelector('.user_save');
    const tagButtons = document.querySelectorAll('.button_box.act');
    const selectedTagsInput = document.getElementById('selectedTags');
    let selectedTags = [];

    tagButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tag = btn.getAttribute('data-tag');

            btn.classList.toggle('selected');

            if (selectedTags.includes(tag)) {
                selectedTags = selectedTags.filter(t => t !== tag);
            } else {
                selectedTags.push(tag);
            }

            if (selectedTagsInput) {
                selectedTagsInput.value = selectedTags.join(',');
            }
        });
    });

    let files = [];

    if (input) {
        input.addEventListener('change', () => {
            Array.from(input.files).forEach(file => {
                files.push(file);
            });
            render();
            input.value = ''; 
        });
    }

    function render() {
        if (!previewList) return; 
        previewList.innerHTML = '';
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = e => {
                const card = document.createElement('div');
                card.className = 'preview-card';
                card.innerHTML = `
                    <img src="${e.target.result}">
                    <div class="remove" data-index="${index}">×</div>
                `;

                card.querySelector('.remove').onclick = () => {
                    files.splice(index, 1);
                    render();
                };
                previewList.appendChild(card);
            };
            reader.readAsDataURL(file);
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const fullNameInput = document.querySelector('input[name="fullName"]');
            const directionInput = document.querySelector('input[name="direction"]');
            const recordBookInput = document.querySelector('input[name="recordBook"]');
            const commentsInput = document.querySelector('textarea[name="comments"]');

            if (!fullNameInput || !recordBookInput) return;

            const fullName = fullNameInput.value.trim();
            const direction = directionInput ? directionInput.value.trim() : "";
            const recordBook = recordBookInput.value.trim();
            const comments = commentsInput ? commentsInput.value.trim() : "";

            if (!fullName || !recordBook) {
                alert('Пожалуйста, заполните основные поля: ФИО и Номер зачетной книжки');
                return;
            }

            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('direction', direction);
            formData.append('recordBook', recordBook);
            formData.append('comments', comments);

            files.forEach(file => {
                formData.append('certificates', file);
            });

            try {
                const response = await fetch('/submit-application', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Заявка успешно отправлена на проверку!');
                    files = [];
                    render();
                    document.querySelectorAll('.container_user_info_input, textarea').forEach(el => el.value = '');
                    window.location.href = '/?success=1'; 
                } else {
                    alert('Ошибка при отправке заявки на сервер');
                }
            } catch (err) {
                console.error('Ошибка:', err);
                alert('Не удалось отправить форму. Проверьте соединение с сервером.');
            }
        });
    }

    if (authBtn) {
        authBtn.addEventListener('click', async () => {
            const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[placeholder*="почта"]');
            const passwordInput = document.querySelector('input[type="password"]') || document.querySelector('input[placeholder*="Пароль"]');

            if (!emailInput || !passwordInput) return;

            try {
                const res = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: emailInput.value, 
                        password: passwordInput.value 
                    })
                });

                const data = await res.json();
                if (data.success) {
                    window.location.href = data.redirect || '/admin';
                } else {
                    alert(data.message || 'Неверный логин или пароль');
                }
            } catch (err) {
                alert('Ошибка авторизации');
            }
        });
    }
});
function closeModal() {
    const modal = document.getElementById('docModal');
    modal.classList.remove('active');
    
    document.body.style.overflow = 'auto';

    const frame = document.getElementById('docFrame') || document.getElementById('docImage');
    if (frame) frame.src = "";
}

window.onclick = function(event) {
    const modal = document.getElementById('docModal');
    if (event.target === modal) {
        closeModal();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeModal();
    }
});
function openModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) modal.classList.remove('active');
}