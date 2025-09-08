/*
    Dit bestand bevat alle code die gebruikt wordt om data op te halen.
    Momenteel gebeurt dit via GitHub.
*/
var receptenboek = [];

// Dit is de link van de server, waar alle gegevens te downloaden en up te daten zijn
const SERVER_LINK_BEGIN = "https://api.github.com/repos/goedestudent/receptenboek-recepten";

/**
 * Standaard actie om uit te voeren als een operatie mislukt
 */
function standaard_fout() {
    alert("Er ging iets mis :(");
}

/**
 * Haalt de gegeven URL op van de server, en geeft daarna het verzoek door aan de gegeven actie.
 * Vervolgens wordt de promise als mislukt of gelukt aangegeven.
 * Omdat deze operatie asynchroon is, wordt een promise teruggegeven. De actie die 
 * bij een successvolle ophaling moet worden uitgevoerd kan worden toegekent met .then(actie).
 * 
 * @param {string}   link         - De link waar de data van moet worden opgehaald.
 * @param {string?}  responseType - Eventuele type van het antwoord van de server. Hoeft niet per sé te worden meegegeven.
 * @param {string?}  contentType  - Eventuele type van het antwoord van de server. Wordt ingevult in de Accept header. Hoeft niet per sé te worden meegegeven. Standaard is vnd.github.raw
 * 
 * @returns {Promise} - Promise die succesvol is als data succesvol werd opgehaald.
 */
 function webserver_verzoek(link, responseType, contentType="vnd.github.raw") {

    // Haal opgeslagen gebruikersnaam en wachtwoord op
    let gebruikersnaam = localStorage.getItem("gebruikersnaam");
    let wachtwoord = localStorage.getItem("wachtwoord");

    // Als één van beide niet is ingevuld, laten we de promise meteen lukken.
    if (gebruikersnaam === null || wachtwoord === null)
        return new Promise((gelukt, mislukt) => mislukt());

    return new Promise(
        (gelukt, mislukt) => {

        let verzoek = new XMLHttpRequest();
        verzoek.onloadend = () => {
            if (verzoek.status === 200) {
                // 200 betekent dat het verzoek helemaal goed is gegaan

                // Stuur verzoek door naar de gegeven actie
                gelukt(verzoek);
            } else if (verzoek.status === 401) {
                // 401 betekent dat er iets mis is in de data.
                // Voor nu gaan we er van uit dat de inloggegevens niet kloppen.

                // Opgeslagen gegevens verwijderen
                localStorage.removeItem("gebruikersnaam");
                localStorage.removeItem("wachtwoord");

                // Gebruiker doorsturen naar de inlogpagina
                alert("Onjuiste inloggegevens! Log opnieuw in.");
                window.location.href = "/inloggen.html";
            } else {
                // Er was een andere fout: laat het verzoek wederom mislukken.
                mislukt(verzoek);
            }
        }
        
        verzoek.open("GET", link);
        verzoek.setRequestHeader("Authorization", `token ${wachtwoord}`);
        verzoek.setRequestHeader("Accept", `application/${contentType}`);

        if(responseType)
            verzoek.responseType = responseType;

        verzoek.send();
    });
}


/**
 * Haalt het receptenboek op van de server, en slaat het op het apparaat op.
 * Omdat deze operatie asynchroon is, wordt een promise teruggegeven. De actie die 
 * bij een successvolle ophaling moet worden uitgevoerd kan worden toegekent met .then(actie).
 * 
 * Als het receptenboek er al is, wordt er een Promise teruggegeven die meteen succesvol is.
 * 
 * @param {boolean} forceer - Dwing toch af dat de nieuwe versie wordt opgehaald. Bijvoorbeeld bij updaten van een recept.
 * @returns {Promise} - Promise die succesvol is als data succesvol werd opgehaald.
 */
function haal_recepten_op(forceer = false) {
    function actie(receptenVerzoek) {
        // Lees alle data in en sla deze op in een globale variabele
        receptenboek = JSON.parse(receptenVerzoek.responseText);
    }

    // Er is al een receptenboek, dus we gaan hem niet opnieuw downloaden
    if (!forceer && receptenboek.length > 0) {
        return new Promise((gelukt) => gelukt());
    }

    let timestamp = "";
    if (forceer)
        timestamp = `?t=${new Date().getTime()}`;

    // Zie ook https://docs.github.com/en/rest/repos/contents#get-repository-content
    return webserver_verzoek(`${SERVER_LINK_BEGIN}/contents/recepten.json${timestamp}`)
        .then(actie, standaard_fout);
}

/**
 * Haalt de SHA-checksum van het gegeven bestand op. Deze is nodig om het te kunnen updaten.
 * @returns {Promise} - promise met als resultaat de SHA van het gevraagde bestand op de server.
 */
 function haal_sha_op(bestand_link) {
    function actie(bestandsVerzoek) {
        // Lees alle data in en haal de sha eruit
        let verzoek = JSON.parse(bestandsVerzoek.responseText);
        return verzoek.sha;
    }

    // Voor de veiligheid mag een bestand alleen worden gedownload als de link van GitHub is, en specifiek van één
    // van mijn receptenboek projecten.
    if (!bestand_link.startsWith("https://api.github.com/repos/goedestudent/receptenboek"))
        return new Promise((_, mislukt) => mislukt());

    // Zie ook https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents
    // De ?t= is toegevoegd, om er voor de zorgen dat chrome niet probeert een te oude versie terug te geven.
    // Als de url al een ? bevat, dan moet het een & worden.
    let tKarakter = bestand_link.indexOf("?") > -1 ? '&' : '?';
    return webserver_verzoek(`${bestand_link}${tKarakter}t=${new Date().getTime()}`, undefined, "json")
        .then(actie);
}

/**
 * Haalt de SHA-checksum van het receptenboek op. Deze is nodig om het te kunnen updaten.
 * @returns {Promise} - promise met als resultaat de SHA van het receptenboek op de server.
 */
function haal_receptenboek_sha_op() {
    return haal_sha_op(`${SERVER_LINK_BEGIN}/contents/recepten.json`).catch(standaard_fout);
}

/**
 * Download een foto van de server, gebruik makend van de login.
 * 
 * @param {string} foto_link - Link naar de foto
 */
function download_foto(foto_link) {
    if (!foto_link)
        return new Promise((gelukt) => gelukt("/img/geen_plaatje.png"));
    function actie(verzoek) {
        let urlCreator = window.URL || window.webkitURL;
        let plaatje = urlCreator.createObjectURL(verzoek.response);
        return plaatje;
    }

    // Wat te doen als er een fout was bij het ophalen
    function actie_bij_fout(verzoek) {
        if (verzoek.status === 404) {
            // 404 wil zeggen dat het plaatje niet gevonden kon worden/niet op de server staat
            return "/img/geen_plaatje.png";
        } else {
            standaard_fout();
        }
    }

    // Voor de veiligheid mag een plaatje alleen worden gedownload als de link van GitHub is, en specifiek van één
    // van mijn receptenboek projecten.
    if (!foto_link.startsWith("https://api.github.com/repos/goedestudent/receptenboek"))
        return new Promise((_, mislukt) => mislukt());

    return webserver_verzoek(foto_link, "blob").then(actie, actie_bij_fout);
}

/**
 * Zelfde als download foto, maar voegt zelf de base-url toe
 * 
 * @param {string} gebruikersnaam - Naam van de gebruiker om foto van op te halen
 */
 function download_profielfoto(gebruikersnaam) {
    return download_foto(`${SERVER_LINK_BEGIN}/contents/${gebruikersnaam}.jpg`);
}

/**
 * Berekent de gemiddelde score die is gegeven aan een gerecht.
 * Wannneer maar één iemand een score gaf, zal die score worden getoont.
 * Wanneer er nog geen reviews zijn, zal een vraagteken worden getoont.
 * 
 * @param {object} recept - Het recept waar de score voor berekent moet worden.
 * @returns {string} - Gemiddelde score of ?
 */
function bereken_score(recept) {
    let totaal = 0;
    let beoordelingen = 0;

    let reviewers = Object.keys(recept.reviews ?? {});

    for (let index = 0; index < reviewers.length; index++) {
        const reviewer = reviewers[index];
        if (recept.reviews[reviewer]) {
            totaal += parseFloat(recept.reviews[reviewer].score);
            beoordelingen++;
        }
    }

    if (beoordelingen === 0)
        return "";
    return totaal / beoordelingen;
}

/**
 * Zet een databestand om naar base64 encodering. Dit is een wrapper om de FileReader heen,
 * zodat het een promise wordt, dus zodat we .then kunnen gebruiken.
 * 
 * De gegeven data moet een Blob zijn. Gebruik bijvoorbeeld `new Blob([data_voor_server], {type : 'application/json'})`.
 * @param {Blob} data - De data die moet worden omgezet naar base64
 * @returns {Promise} - Promise met als resultaat de base64-geëncodeerde data
 */
function zet_om_naar_base64(data) {
    // Een reader openen, die het bestand kan omzetten naar base64.
    // Dat kunnen we dan weer naar de server sturen, want github wil het hebben in base64 formaat.
    return new Promise (
        function (gelukt, mislukt) {
            let reader = new FileReader();
            reader.onload  = () => gelukt(reader.result);
            reader.onerror = (foutmelding) => mislukt(foutmelding);
            reader.readAsDataURL(data);
        }
    );
}

/**
 * Upload de gegeven data naar de server
 * @param {Blob} data - Blob van de data die moet worden geupload.
 * @param {*} bestandsnaam - Naam van het bestand waarnaar de data moet worden geupload.
 * @param {*} commit_bericht - Welk bericht geplaatst moet worden bij de upload
 * @param {*} sha - Als het een update van een bestand is, wat de SHA van het originele bestand is.
 * @returns {Promise} - Promise die lukt als de upload succesvol was en anders faalt.
 */
function stuur_data(data, bestandsnaam, commit_bericht, sha) {

    // Haal opgeslagen gebruikersnaam en wachtwoord op
    let gebruikersnaam = localStorage.getItem("gebruikersnaam");
    let wachtwoord = localStorage.getItem("wachtwoord");

    // Als één van beide niet is ingevuld, laten we de promise meteen lukken.
    if (gebruikersnaam === null || wachtwoord === null)
        return new Promise((gelukt, mislukt) => mislukt());

    return new Promise(
        (gelukt, mislukt) => {
            zet_om_naar_base64(data).then((base64_data) => {
                let data_voor_github = {
                    sha,
                    message: commit_bericht,
                    content: base64_data.replace(/data.*base64,/g, ""),
                    committer: {
                        name: gebruikersnaam,
                        email: gebruikersnaam + "@jammiesmikkel.jaan.pro"
                    }
                }
        
                let verzoek = new XMLHttpRequest();
                verzoek.onloadend = () => {
                    if (verzoek.status === 200 || verzoek.status === 201) {
                        // 200 en 201 betekenen dat het verzoek helemaal goed is gegaan
        
                        // Stuur verzoek door naar de gegeven actie
                        gelukt(verzoek.responseText);
                    } else if (verzoek.status === 401) {
                        // 401 betekent dat er iets mis is in de data.
                        // Voor nu gaan we er van uit dat de inloggegevens niet kloppen.
        
                        // Opgeslagen gegevens verwijderen
                        localStorage.removeItem("gebruikersnaam");
                        localStorage.removeItem("wachtwoord");
        
                        // Gebruiker doorsturen naar de inlogpagina
                        alert("Onjuiste inloggegevens! Log opnieuw in.");
                        window.location.href = "/inloggen.html";
                    } else {
                        // Er was een andere fout: laat het verzoek wederom mislukken.
                        alert("Er ging iets mis :(");
                        mislukt();
                    }
                }
                
                verzoek.open("PUT", `${SERVER_LINK_BEGIN}/contents/${bestandsnaam}`);
                verzoek.setRequestHeader("Authorization", `token ${wachtwoord}`);
                verzoek.setRequestHeader("Accept", `application/vnd.github+json`);
        
                verzoek.send(JSON.stringify(data_voor_github));
            });
        });
}

/**
 * Stuurt de gegeven feedback naar de server
 * @param {string} titel    - De titel van de feedback
 * @param {string} bericht  - Het bericht dat in de feedback moet komen
 * @param {string[]} labels - Welke labels moeten worden toegekend aan de feedback (bug, feedback, feature request, ...)
 * @returns {Promise} - Promise die lukt als de aanmaak succesvol was en anders faalt.
 */
function stuur_feedback(titel, bericht, labels = []) {

    // Haal opgeslagen gebruikersnaam en wachtwoord op
    let gebruikersnaam = localStorage.getItem("gebruikersnaam");
    let wachtwoord = localStorage.getItem("wachtwoord");

    // Als één van beide niet is ingevuld, laten we de promise meteen lukken.
    if (gebruikersnaam === null || wachtwoord === null)
        return new Promise((gelukt, mislukt) => mislukt());

    return new Promise(
        (gelukt, mislukt) => {
            let data_voor_github = {
                title: titel,
                body: bericht,
                labels: labels,
            }
    
            let verzoek = new XMLHttpRequest();
            verzoek.onloadend = () => {
                if (verzoek.status === 200 || verzoek.status === 201) {
                    // 200 en 201 betekenen dat het verzoek helemaal goed is gegaan
    
                    // Stuur verzoek door naar de gegeven actie
                    gelukt(verzoek.responseText);
                } else if (verzoek.status === 401) {
                    // 401 betekent dat er iets mis is in de data.
                    // Voor nu gaan we er van uit dat de inloggegevens niet kloppen.
    
                    // Opgeslagen gegevens verwijderen
                    localStorage.removeItem("gebruikersnaam");
                    localStorage.removeItem("wachtwoord");
    
                    // Gebruiker doorsturen naar de inlogpagina
                    alert("Onjuiste inloggegevens! Log opnieuw in.");
                    window.location.href = "/inloggen.html";
                } else {
                    // Er was een andere fout: laat het verzoek wederom mislukken.
                    alert("Er ging iets mis :(");
                    mislukt();
                }
            }
            
            verzoek.open("POST", `${SERVER_LINK_BEGIN}/issues`);
            verzoek.setRequestHeader("Authorization", `token ${wachtwoord}`);
            verzoek.setRequestHeader("Accept", `application/vnd.github+json`);
    
            verzoek.send(JSON.stringify(data_voor_github));
        });
}