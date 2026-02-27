// ⚠️ INSERISCI QUI LA TUA API KEY DI GOOGLE AI STUDIO
const API_KEY = 'AIzaSyDAL3H_sETJF56SqMH1mW5eWV2CzxhnRm4';

function gestisciInvio(e) {
    if (e.key === 'Enter') cerca();
}

async function cerca() {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) return;

    document.getElementById('loading').style.display = 'block';
    document.getElementById('resultBox').style.display = 'none';

    const prompt = `Sei un dizionario linguistico avanzato. Analizza la seguente parola o frase: "${query}".
    Lingue supportate in output: Italiano, Spagnolo, Inglese.
    Il tuo compito è restituire ESCLUSIVAMENTE un oggetto JSON valido con questa esatta struttura:
    {
      "parola_frase": "la parola o frase originale inserita",
      "lingua_rilevata": "scrivi solo 'Italiano', 'Spagnolo' o 'Inglese'",
      "significato": "Spiegazione chiara e completa nella lingua rilevata",
      "sinonimi": ["sinonimo 1", "sinonimo 2", "sinonimo 3"],
      "traduzioni": {
        "Lingua_1": "traduzione nella prima delle altre due lingue",
        "Lingua_2": "traduzione nella seconda delle altre due lingue"
      }
    }`;

    try {
        // Usa il modello standard più recente
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { 
                    responseMimeType: "application/json"
                }
            })
        });

        const data = await response.json();

        // CONTROLLO ERRORI: Se Google ci risponde con un errore (es. 404, 400), lo blocchiamo qui e mostriamo il motivo esatto
        if (!response.ok) {
            console.error("Dettagli Errore API:", data);
            throw new Error(`Google AI ha restituito un errore: ${data.error?.message || 'Errore sconosciuto'}`);
        }
        
        const jsonText = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(jsonText);

        document.getElementById('resTitle').innerText = result.parola_frase;
        document.getElementById('resLang').innerText = result.lingua_rilevata;
        document.getElementById('resMeaning').innerText = result.significato;
        document.getElementById('resSyn').innerText = result.sinonimi.length > 0 ? result.sinonimi.join(', ') : 'Nessuno trovato';

        const transList = document.getElementById('resTrans');
        transList.innerHTML = '';
        for (const [lang, trans] of Object.entries(result.traduzioni)) {
            transList.innerHTML += `<li class="list-group-item"><strong class="text-primary">${lang}:</strong> ${trans}</li>`;
        }

        document.getElementById('loading').style.display = 'none';
        document.getElementById('resultBox').style.display = 'block';

    } catch (error) {
        // Ora vedrai l'errore esatto direttamente nella console!
        console.error("Errore rilevato dal blocco catch:", error);
        alert(`Si è verificato un errore: ${error.message}\n\nControlla la console del browser (F12) per i dettagli.`);
        document.getElementById('loading').style.display = 'none';
    }
}