gebruikersnaam_veld = document.getElementById("gebruikersnaam");
gebruikersnaam_veld.innerText = localStorage.getItem("gebruikersnaam");
uitlogknop = document.getElementById("uitlogknop");
toevoegknop = document.getElementById("toevoegknop");
feedbackknop = document.getElementById("feedbackknop");
doorstuurknop = document.getElementById("doorstuurknop");

/**
 * Logt de gebruiker uit door de gebruikersnaam en het wachtwoord te verwijderen.
 * Herlaad daarna de applicatie.
 */
function log_uit() {
    localStorage.removeItem("gebruikersnaam");
    localStorage.removeItem("wachtwoord");
    window.location.href = "/";
}

/**
 * Leest het recept uit de localstorage in, en opent het in WhatsApp om door te sturen.
 */
function stuur_recept_door() {
    const recept = localStorage.getItem("huidig-recept");
    window.open(`whatsapp://send?text=${encodeURIComponent(recept)}`);
}

uitlogknop.addEventListener("click", log_uit);
toevoegknop.addEventListener("click", () => ga_naar_pagina("/recept_maken"));
feedbackknop.addEventListener("click", () => ga_naar_pagina("/feedback"));
doorstuurknop.addEventListener("click", () => stuur_recept_door());

// Er is geen recept waarbij het opslaan mis ging, dus de knop kunnen we verbergen.
if (!localStorage.getItem("huidig-recept")) {
    doorstuurknop.style.display = "none";
}