// SHA-256 hash of "1985"
const PIN_HASH = '78e370b587b145920213731b7c7c725e512b3b6577c51c800218a7c764c532ae';

async function sha256(str) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

(async function initLock() {
    const lockScreen = document.getElementById('lockScreen');
    const pinInput = document.getElementById('pinInput');
    const pinSubmit = document.getElementById('pinSubmit');
    const pinError = document.getElementById('pinError');

    async function tryUnlock() {
        const hash = await sha256(pinInput.value);
        if (hash === PIN_HASH) {
            lockScreen.classList.add('unlocked');
            document.getElementById('searchInput').focus();
        } else {
            pinError.textContent = 'PIN incorect. Încearcă din nou.';
            pinInput.value = '';
            pinInput.focus();
        }
    }

    pinSubmit.addEventListener('click', tryUnlock);
    pinInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
    pinInput.focus();
})();

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const status = document.getElementById('status');
    const noResults = document.getElementById('noResults');
    let rowsData = [];

    fetch('date.csv')
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
            
            // Procesăm fiecare linie pentru a separa ID-ul de Nume
            rowsData = lines.map(line => {
                const parts = line.split(';'); // Folosește ; sau , în funcție de CSV-ul tău
                return { id: parts[0] || '', name: parts[1] || '' };
            });

            renderTable(rowsData);
            status.textContent = `Produse disponibile: ${rowsData.length}`;
        })
        .catch(err => {
            status.textContent = "Eroare la încărcarea date.csv";
            console.error(err);
        });

    function renderTable(data) {
        tableBody.innerHTML = data.map(item => `
            <tr>
                <td><strong>${item.id}</strong></td>
                <td>${item.name}</td>
            </tr>
        `).join('');
    }

    searchInput.addEventListener('input', (e) => {
        const queryWords = e.target.value.toLowerCase().trim().split(/\s+/);
        const rows = tableBody.getElementsByTagName('tr');
        let visibleCount = 0;

        for (let i = 0; i < rows.length; i++) {
            const rowText = rows[i].textContent.toLowerCase();
            
            // Verifică dacă toate cuvintele căutate se află în rând (indiferent de ordine)
            const match = queryWords.every(word => rowText.includes(word));
            
            if (match) {
                rows[i].style.display = "";
                visibleCount++;
            } else {
                rows[i].style.display = "none";
            }
        }

        status.textContent = `Găsite: ${visibleCount}`;
        noResults.className = visibleCount === 0 ? "" : "hidden";
    });
});