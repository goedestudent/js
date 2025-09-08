/*
    In dit JavaScript bestand komen de functies die op alle paginas (kunnen) voorkomen.
    Denk bijvoorbeeld aan functies t.b.v. de bovenbalk.
*/

let header_account_naam = document.getElementById("header-account-naam");
let header_account_link = document.getElementById("header-account");

if (header_account_naam) {
    if (localStorage.getItem("gebruikersnaam") && localStorage.getItem("wachtwoord")) {
        header_account_naam.innerText = localStorage.getItem("gebruikersnaam");
        header_account_link.href = "/account";
    } else {
        header_account_naam.innerText = "Inloggen";
    }
}

if (navigator.serviceWorker)
    navigator.serviceWorker.register('/serviceworker.js', {scope: '/'});

/**
 *  Stelt de titel van zowel het tabblad als de Open Graph in op de gegeven waarde
 * 
 * @param {string} naam - Nieuwe naam voor het tabblad
 */
function verander_tabblad_titel(naam) {
    document.title = naam;
    document.getElementById("og-title").content = naam;
}

/**
 * Zorgt er voor dat als er meer tekst komt in een tekstvak, dat het tekstvak automatisch groter wordt zodat er geen scroll-balkje verschijnt.
 * 
 * @param {HTMLElement} tekstvak - Tekstvak dat automatisch vergroot moet worden
 */
 function pas_automatisch_grootte_aan(tekstvak) {
    tekstvak.addEventListener("input", () => {
        tekstvak.style.height = "";
        tekstvak.style.height = tekstvak.scrollHeight + 3 + "px";
    });
}

/**
 * Deze functie zorgt ervoor dat labels van verplichte invoeren een sterretje krijgen, en dat
 * de grootte van een tekstvak automatisch wordt aangepast wanneer er iets in wordt getypt.
 */
function initialiseer_invoeren() {
    // Zet een ster bij alle labels waarvan de invoer verplicht is
    labels.forEach(
        (label) => 
        {
            if (label.nextElementSibling && label.nextElementSibling.required)
                label.setAttribute("required", true);
        }
    );

    document.querySelectorAll("textarea").forEach((tekstvak) => pas_automatisch_grootte_aan(tekstvak));
}