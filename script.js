// Parola "1985" encodată (MTk4NQ==)
const COD_ACCES_ENCODAT = "MTk4NQ=="; 

// Funcția principală de verificare
function checkPassword() {
    console.log("Buton apăsat!"); // Verificare în consolă
    
    const inputField = document.getElementById('passwordInput');
    const errorMsg = document.getElementById('loginError');
    
    if (!inputField) return;

    const parolaIntrodusa = inputField.value.trim();
    const inputEncodat = btoa(parolaIntrodusa);

    if (inputEncodat === COD_ACCES_ENCODAT) {
        console.log("Parolă corectă!");
        sessionStorage.setItem('isAuthorized', 'true');
        runApp();
    } else {
        console.log("Parolă greșită!");
        errorMsg.classList.remove('hidden');
        errorMsg.style.display = "block";
        inputField.value = "";
    }
}

// Funcția care încarcă datele
async function runApp() {
    try {
        const response = await fetch('data.db');
        if (!response.ok) throw new Error("Fișierul data.db nu a putut fi găsit.");
        
        const base64Content = await response.text();
const cleanBase64 = base64Content.replace(/\s/g, ''); // Elimină spații, tab-uri, rânduri noi
const decodedCSV = decodeURIComponent(escape(atob(cleanBase64)));base64Content.trim());
        
        const lines = decodedCSV.split(/\r?\n/).filter(line => line.trim() !== "");
        
        window.catalogProduse = lines.map(line => {
            const coloane = line.split(';');
            return {
                id: coloane[0] ? coloane[0].trim() : '',
                nume: coloane[1] ? coloane[1].trim() : ''
            };
        });

        renderTable(window.catalogProduse);

        // Afișare interfață
        document.getElementById('loginScreen').style.display = "none";
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('status').textContent = `Total: ${window.catalogProduse.length}`;

    } catch (err) {
        alert("Eroare: " + err.message);
    }
}

function renderTable(date) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    tableBody.innerHTML = date.map(p => `
        <tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.nume}</td>
        </tr>
    `).join('');
}

// Logica de căutare
document.addEventListener('input', (e) => {
    if (e.target.id === 'searchInput') {
        const query = e.target.value.toLowerCase().trim().split(/\s+/);
        const randuri = document.querySelectorAll('#tableBody tr');
        let gasite = 0;

        randuri.forEach(rand => {
            const textRand = rand.textContent.toLowerCase();
            const match = query.every(cuvant => textRand.includes(cuvant));
            rand.style.display = match ? "" : "none";
            if (match) gasite++;
        });

        document.getElementById('status').textContent = `Rezultate: ${gasite}`;
    }
});

// ATAȘARE EVENIMENTE - VARIANTA SIGURĂ
document.addEventListener('click', (e) => {
    if (e.target.id === 'loginBtn') {
        checkPassword();
    }
});

document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.id === 'passwordInput') {
        checkPassword();
    }
});

// Verificare sesiune la încărcare
window.onload = () => {
    if (sessionStorage.getItem('isAuthorized') === 'true') {
        runApp();
    }
};