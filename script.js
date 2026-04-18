// Hash SHA-256 pentru parola "1985"
const SECRET_HASH = "7469584449830882e8e392686861614f04c643907c080004f2f09d84c3603d6d";

// Funcție pentru generarea hash-ului (criptare)
async function generateHash(text) {
    const msgBuffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Verificare parolă
async function checkPassword() {
    const input = document.getElementById('passwordInput').value;
    const inputHash = await generateHash(input);

    if (inputHash === SECRET_HASH) {
        sessionStorage.setItem('isAuthorized', 'true');
        runApp();
    } else {
        const error = document.getElementById('loginError');
        error.classList.remove('hidden');
        document.getElementById('passwordInput').value = "";
    }
}

// Încărcare date din data.db (Base64)
async function runApp() {
    try {
        const response = await fetch('data.db');
        if (!response.ok) throw new Error("Fișierul data.db lipsește!");
        
        const base64Data = await response.text();
        const decodedData = atob(base64Data); // Decodificăm din Base64
        
        const lines = decodedData.split(/\r?\n/).filter(line => line.trim() !== "");
        window.allProducts = lines.map(line => {
            const parts = line.split(';');
            return { id: parts[0] || '', name: parts[1] || '' };
        });

        renderTable(window.allProducts);
        
        // Comutăm ecranele
        document.getElementById('loginScreen').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('status').textContent = `Total produse: ${window.allProducts.length}`;
        
    } catch (err) {
        alert("Eroare critică: " + err.message);
    }
}

function renderTable(data) {
    const body = document.getElementById('tableBody');
    body.innerHTML = data.map(item => `
        <tr>
            <td><strong>${item.id}</strong></td>
            <td>${item.name}</td>
        </tr>
    `).join('');
}

// Filtrare (Search)
document.getElementById('searchInput').addEventListener('input', (e) => {
    const terms = e.target.value.toLowerCase().trim().split(/\s+/);
    const tableRows = document.querySelectorAll('#tableBody tr');
    let visibleCount = 0;

    tableRows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        const isMatch = terms.every(term => rowText.includes(term));
        
        row.style.display = isMatch ? "" : "none";
        if (isMatch) visibleCount++;
    });

    document.getElementById('status').textContent = `Găsite: ${visibleCount}`;
    document.getElementById('noResults').className = visibleCount === 0 ? "" : "hidden";
});

// Ascultăm tasta Enter pentru login
document.getElementById('passwordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
});
document.getElementById('loginBtn').addEventListener('click', checkPassword);

// Păstrare sesiune la refresh
window.onload = () => {
    if (sessionStorage.getItem('isAuthorized') === 'true') {
        runApp();
    }
};