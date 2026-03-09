function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';

    toast.innerHTML = `
        <i class="fa-solid fa-${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

document.getElementById('generateBtn').addEventListener('click', generateEscala);
document.getElementById('copyBtn').addEventListener('click', copyEscala);
document.getElementById('printBtn').addEventListener('click', () => window.print());
document.getElementById('pdfBtn').addEventListener('click', exportPDF);

function generateEscala() {
    const namesText = document.getElementById('names').value.trim();
    if (!namesText) {
        showToast('Por favor, adicione os nomes dos responsáveis.', 'warning');
        return;
    }

    const names = namesText.split('\n').map(n => n.trim()).filter(n => n !== '');
    if (names.length === 0) {
        showToast('Por favor, adicione pelo menos um nome válido.', 'warning');
        return;
    }

    const btn = document.getElementById('generateBtn');
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Gerando...';
    btn.disabled = true;

    // Simulate slight delay for effect
    setTimeout(() => {
        const domingoTodos = document.getElementById('domingoTodos').checked;
        const routeSelect = document.getElementById('route-select');
        const selectedRouteText = routeSelect.options[routeSelect.selectedIndex].text;

        // Update header subtitle with route
        document.querySelector('header p').innerText = `Rota: ${selectedRouteText}`;

        const escalaBody = document.getElementById('escalaBody');
        escalaBody.innerHTML = '';

        const days = [
            { name: 'Sexta-feira', key: 'friday', hours: 24, start: 0 },
            { name: 'Sábado', key: 'saturday', hours: 24, start: 0 },
            { name: 'Domingo', key: 'sunday', hours: 12, start: 0 }
        ];

        let nameIndex = 0;
        let delay = 0;

        days.forEach(day => {
            for (let hour = day.start; hour < day.hours; hour += 2) {
                const startStr = hour.toString().padStart(2, '0') + ':00';
                const endHour = (hour + 2) % 24;
                const endStr = endHour.toString().padStart(2, '0') + ':00';

                let responsavel = '';

                // Regra especial Domingo TODOS
                if (day.key === 'sunday' && domingoTodos && hour >= 8 && hour < 12) {
                    responsavel = 'TODOS';
                } else {
                    responsavel = names[nameIndex % names.length];
                    nameIndex++;
                }

                const tr = document.createElement('tr');
                tr.style.animationDelay = `${delay}s`;
                tr.className = 'row-animate';
                tr.innerHTML = `
                    <td class="day-${day.key}"><span class="badge ${day.key}">${day.name}</span></td>
                    <td><div class="time-cell"><i class="fa-regular fa-clock"></i> ${startStr} às ${endStr}</div></td>
                    <td><strong>${responsavel}</strong></td>
                `;
                escalaBody.appendChild(tr);
                delay += 0.03;
            }
        });

        btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Gerar Escala';
        btn.disabled = false;
        showToast('Escala gerada com sucesso!', 'success');
    }, 400);
}

function copyEscala() {
    const table = document.getElementById('escalaTable');
    if (!table || document.querySelectorAll('#escalaBody tr.row-animate').length === 0) {
        showToast('Gere a escala primeiro antes de copiar!', 'error');
        return;
    }

    let text = 'ESCALA DE RONDAS\n\n';
    const rows = document.querySelectorAll('#escalaBody tr');

    rows.forEach(row => {
        if (row.classList.contains('empty-state')) return;
        const cols = row.querySelectorAll('td');
        if (cols.length >= 3) {
            text += `${cols[0].innerText.trim()} | ${cols[1].innerText.trim()} | ${cols[2].innerText.trim()}\n`;
        }
    });

    navigator.clipboard.writeText(text).then(() => {
        showToast('Escala copiada para a área de transferência!', 'success');
    }).catch(err => {
        showToast('Erro ao copiar a escala.', 'error');
        console.error('Erro ao copiar: ', err);
    });
}

function exportPDF() {
    const table = document.getElementById('escalaTable');
    if (!table || document.querySelectorAll('#escalaBody tr.row-animate').length === 0) {
        showToast('Gere a escala primeiro antes de exportar!', 'error');
        return;
    }

    const element = document.getElementById('tableContainer');
    const title = document.querySelector('header h1').innerText;
    const subtitle = document.querySelector('header p').innerText;

    const pdfContent = document.createElement('div');
    pdfContent.style.padding = '30px';
    pdfContent.style.fontFamily = "'Outfit', sans-serif";
    pdfContent.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0;">
            <h1 style="color: #0f172a; margin-bottom: 8px; font-size: 28px;">${title}</h1>
            <p style="color: #64748b; font-size: 16px;">${subtitle}</p>
        </div>
        ${element.innerHTML}
    `;

    // Remove animation classes and icons for PDF clarity if needed, but styling usually overrides
    const cells = pdfContent.querySelectorAll('.time-cell i');
    cells.forEach(c => c.remove());

    const opt = {
        margin: [0.5, 0.5],
        filename: 'escala-ronda.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    showToast('Gerando PDF...', 'info');
    html2pdf().set(opt).from(pdfContent).save().then(() => {
        showToast('PDF exportado com sucesso!', 'success');
    });
}
