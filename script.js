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