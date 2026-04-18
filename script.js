
const COD_ACCES_ENCODAT = "MTk4NQ=="; 

/**
 * FUNCȚIA DE LOGIN
 */
function checkPassword() {
    const inputField = document.getElementById('passwordInput');
    const errorMsg = document.getElementById('loginError');
    
    // Luăm ce a scris utilizatorul și ștergem eventualele spații accidentale
    const parolaIntrodusa = inputField.value.trim();
    
    // Transformăm ce a scris utilizatorul în Base64 pentru a compara cu codul stocat
    const inputEncodat = btoa(parolaIntrodusa);

    if (inputEncodat === COD_ACCES_ENCODAT) {
        // Dacă e corect, salvăm în sesiune și pornim aplicația
        sessionStorage.setItem('isAuthorized', 'true');
        runApp();
    } else {
        // Dacă e greșit, arătăm eroarea
        errorMsg.classList.remove('hidden');
        errorMsg.style.display = "block";
        inputField.value = "";
        inputField.focus();
    }
}

/**
 * FUNCȚIA CARE ÎNCARCĂ ȘI AFIȘEAZĂ DATELE
 */
async function runApp() {
    const loginScreen = document.getElementById('loginScreen');
    const mainContent = document.getElementById('mainContent');
    const status = document.getElementById('status');
    const tableBody = document.getElementById('tableBody');

    try {
        // Încărcăm fișierul data.db (care conține CSV-ul tău encodat în Base64)
        const response = await fetch('data.db');
        if (!response.ok) throw new Error("Fișierul de date nu a putut fi găsit.");
        
        const base64Content = await response.text();
        
        // Decodificăm conținutul bazei de date
        const decodedCSV = atob(base64Content.trim());
        
        // Împărțim textul în linii
        const lines = decodedCSV.split(/\r?\n/).filter(line => line.trim() !== "");
        
        // Salvăm datele într-o variabilă globală pentru a putea face search în ele
        window.catalogProduse = lines.map(line => {
            const coloane = line.split(';');
            return {
                id: coloane[0] ? coloane[0].trim() : '',
                nume: coloane[1] ? coloane[1].trim() : ''
            };
        });

        // Generăm rândurile în tabel
        renderTable(window.catalogProduse);

        // Ascundem ecranul de login și arătăm catalogul
        loginScreen.style.display = "none";
        mainContent.classList.remove('hidden');
        status.textContent = `Total produse: ${window.catalogProduse.length}`;

    } catch (err) {
        console.error(err);
        alert("Eroare la încărcare: Asigurați-vă că data.db este corect formatat Base64.");
    }
}

/**
 * FUNCȚIA DE DESENARE A TABELULUI
 */
function renderTable(date) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = date.map(p => `
        <tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.nume}</td>
        </tr>
    `).join('');
}

/**
 * LOGICA DE CĂUTARE (SEARCH)
 */
document.getElementById('searchInput').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim().split(/\s+/);
    const randuri = document.querySelectorAll('#tableBody tr');
    let gasite = 0;

    randuri.forEach(rand => {
        const textRand = rand.textContent.toLowerCase();
        // Căutare "fuzzy": verifică dacă toate cuvintele se află în rând
        const match = query.every(cuvant => textRand.includes(cuvant));
        
        if (match) {
            rand.style.display = "";
            gasite++;
        } else {
            rand.style.display = "none";
        }
    });

    document.getElementById('status').textContent = `Rezultate: ${gasite}`;
    
    // Arătăm mesajul de "nu s-a găsit nimic" dacă e cazul
    const noRes = document.getElementById('noResults');
    if (gasite === 0) {
        noRes.classList.remove('hidden');
        noRes.style.display = "block";
    } else {
        noRes.classList.add('hidden');
        noRes.style.display = "none";
    }
});

/**
 * EVENIMENTE AUXILIARE (Taste, Sesiune)
 */

// Permite logarea prin tasta "Enter"
document.getElementById('passwordInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkPassword();
});

// Verificăm dacă utilizatorul a fost deja autorizat în acest tab
window.onload = () => {
    if (sessionStorage.getItem('isAuthorized') === 'true') {
        runApp();
    }
};

// Atribuim funcția butonului de login (dacă nu e deja pusă în HTML)
document.getElementById('