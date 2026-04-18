
const COD_ACCES_ENCODAT = "MTk4NQ=="; 

// Funcția de verificare parolă
function checkPassword() {
    const inputField = document.getElementById('passwordInput');
    const errorMsg = document.getElementById('loginError');
    
    if (!inputField) return;

    const parolaIntrodusa = inputField.value.trim();
    if (btoa(parolaIntrodusa) === COD_ACCES_ENCODAT) {
        sessionStorage.setItem('isAuthorized', 'true');
        runApp();
    } else {
        errorMsg.classList.remove('hidden');
        errorMsg.style.display = "block";
        inputField.value = "";
    }
}

// Funcția de încărcare date
async function runApp() {
    try {
        const response = await fetch('data.db');
        if (!response.ok) throw new Error("Fișierul data.db nu a putut fi găsit.");
        
        let base64Content = await response.text();
        // Curățăm codul de spații sau caractere ciudate
        base64Content = base64Content.replace(/[^A-Za-z0-9+/=]/g, "");
        
        // Decodificare sigură pentru diacritice
        const binaryString = atob(base64Content);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const decodedCSV = new TextDecoder('utf-8').decode(bytes);
        
        const lines = decodedCSV.split(/\r?\n/).filter(line => line.trim() !== "");
        
        window.catalogProduse = lines.map(line => {
            const coloane = line.split(';');
            return {
                id: coloane[0] ? coloane[0].trim() : '',
                nume: coloane[1] ? coloane[1].trim() : ''
            };
        });

        renderTable(window.catalogProduse);

        document.getElementById('loginScreen').style.display = "none";
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('status').textContent = `Total: ${window.catalogProduse.length}`;

    } catch (err) {
        alert("Eroare la date: " + err.message);
    }
}

function renderTable(date) {
    const tableBody = document.getElementById('tableBody');
    if (!tableBody) return;
    tableBody.innerHTML = date.map(p => `<tr><td><strong>${p.id}</strong></td><td>${p.nume}</td></tr>`).join('');
}

// Gestionare evenimente (Click și Enter)
document.addEventListener('click', function(e) {
    if (e.target.id === 'loginBtn') checkPassword();
});

document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && e.target.id === 'passwordInput') checkPassword();
});

document.addEventListener('input', function(e) {
    if (e.target.id === 'searchInput') {
        const query = e.target.value.toLowerCase().trim().split(/\s+/);
        const randuri = document.querySelectorAll('#tableBody tr');
        let gasite = 0;

        randuri.forEach(rand => {
            const textRand = rand.textContent.toLowerCase();
            const match = query.every(word => textRand.includes(word));
            rand.style.display = match ? "" : "none";
            if (match) gasite++;
        });

        document.getElementById('status').textContent = `Rezultate: ${gasite}`;
    }
});

// Verificare sesiune la refresh
window.onload = function() {
    if (sessionStorage.getItem('isAuthorized') === 'true') {
        runApp();
    }
};