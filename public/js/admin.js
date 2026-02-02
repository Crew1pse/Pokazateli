function showDoc(path, requestId) {
    const modal = document.getElementById('docModal');
    const frame = document.getElementById('docFrame');
    const img = document.getElementById('docImage');

    if (!path) return;

    const fileName = path.split(/[\\/]/).pop(); 
    
    let cleanPath = '/uploads/' + fileName;
    
    cleanPath = cleanPath.replace(/\/+/g, '/');

    console.log("Пытаюсь открыть файл по пути:", cleanPath);
    
    frame.src = cleanPath;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (requestId) {
        performOCR(cleanPath, requestId);
    }
}

function calculateTotal(request) {
    const scores = {
        public: 0, culture: 0, sport: 0, study: 0, science: 0, total: 0
    };

    const categoryMap = {
        'Общественная': 'public',
        'Культурная': 'culture',
        'Спортивная': 'sport',
        'Учебная': 'study',
        'Научная': 'science'
    };

    const checkboxes = request.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        const val = cb.value;
        if (val === 'proforg') scores.public += 2;
        else if (val === 'tutor') scores.public += 2;
        else if (val === 'volunteer') scores.public += 3;
        else if (val === 'profburo') scores.public += 2;
    });

    const selects = request.querySelectorAll('.event-select');
    selects.forEach(select => {
        const opt = select.options[select.selectedIndex];
        if (!opt || !opt.value) return; 

        const pts = parseInt(opt.getAttribute('data-points')) || 0;
        const rawCategory = opt.getAttribute('data-category');
        const categoryKey = categoryMap[rawCategory] || 'public';

        if (scores.hasOwnProperty(categoryKey)) {
            scores[categoryKey] += pts;
        }
    });

    scores.total = scores.public + scores.culture + scores.sport + scores.study + scores.science;

    const update = (selector, value) => {
        const el = request.querySelector(selector);
        if (el) el.textContent = value;
    };

    update('.total-study', scores.study);
    update('.total-science', scores.science);
    update('.total-sport', scores.sport);
    update('.total-culture', scores.culture);
    update('.total-public', scores.public);
    update('.total-display', scores.total);

    request.dataset.finalScores = JSON.stringify(scores);
}

document.addEventListener('change', e => {
    const request = e.target.closest('.request');
    if (request) calculateTotal(request);
});

document.addEventListener('click', e => {
    const toggle = e.target.closest('.toggle');
    if (toggle) {
        const request = toggle.closest('.request');
        request.classList.toggle('open');
        toggle.textContent = request.classList.contains('open') ? '▴' : '▾';

        if (request.classList.contains('open')) {
            const statusDiv = request.querySelector('[id^="status-"]');
            if (statusDiv && statusDiv.dataset.scanned !== "true") {
                const appId = statusDiv.id.split('-')[1];
                scanCertificate(appId);
            }
        }
        return;
    }

    if (e.target.classList.contains('details-result-btn')) {
        handleApprove(e.target);
    }
});

async function scanCertificate(appId) {
    const statusText = document.getElementById(`status-${appId}`);
    if (!statusText) return;

    const request = statusText.closest('.request');
    
    try {
        const response = await fetch(`/admin/scan/${appId}`);
        const data = await response.json();

        if (data.detectedEvent) {
            statusText.innerHTML = `Найдено: <b>${data.detectedEvent.name}</b> (+${data.detectedEvent.points} б.)`;
            const selects = request.querySelectorAll('.event-select');
            
            for (let select of selects) {
                if (select.value === "") {
                    select.value = data.detectedEvent._id;
                    break;
                }
            }
            calculateTotal(request);
            statusText.dataset.scanned = "true";
        } else {
            statusText.innerText = "Совпадений не найдено.";
            statusText.dataset.scanned = "true";
        }
    } catch (err) {
        statusText.innerText = "Ошибка сканирования.";
    }
}

async function handleApprove(btn) {
    const request = btn.closest('.request');
    const appId = request.querySelector('[id^="status-"]').id.split('-')[1];
    
    if (!request.dataset.finalScores) calculateTotal(request);
    const scores = JSON.parse(request.dataset.finalScores);

    if (!confirm(`Утвердить балл: ${scores.total}?`)) return;

    try {
        const response = await fetch(`/admin/approve/${appId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scores: scores,
                comment: request.querySelector('.info').value
            })
        });

        if (response.ok) {
            alert("Успешно!");
            request.remove();
        }
    } catch (err) {
        alert("Ошибка сервера.");
    }
}

async function performOCR(imagePath, requestId) {
    const statusDiv = document.getElementById(`status-${requestId}`);
    const requestElement = document.querySelector(`.request[data-id="${requestId}"]`);
    
    const studentName = requestElement.querySelector('h2').textContent.trim().toLowerCase();

    try {
        const result = await Tesseract.recognize(imagePath, 'rus+eng');
        const detectedText = result.data.text.toLowerCase();

        console.log("Распознанный текст:", detectedText);

        const isNameFound = detectedText.includes(studentName);
        
        if (statusDiv) {
            if (isNameFound) {
                statusDiv.innerHTML = "ФИО подтверждено в документе";
                statusDiv.style.color = "#27ae60";
            } else {
                statusDiv.innerHTML = " ФИО студента не найдено в тексте документа!";
                statusDiv.style.color = "#e74c3c";
                requestElement.style.border = "2px solid #e74c3c";
            }
        }

    } catch (error) {
        console.error("Ошибка OCR:", error);
        if (statusDiv) statusDiv.innerHTML = "Ошибка при сканировании";
    }
}

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