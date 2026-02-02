document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.table_box_btn_list');
    const rows = document.querySelectorAll('.student-row');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');

            rows.forEach(row => {
                if (category === 'all') {
                    row.style.display = '';
                } else {
                    const score = parseFloat(row.getAttribute(`data-${category}`)) || 0;

                    if (score > 0) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    });
});