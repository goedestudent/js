labels = document.querySelectorAll("label");
feedback_titel = document.getElementById("feedback-titel");
feedback_tekst = document.getElementById("feedback-tekst");
formulier = document.getElementById("feedback-formulier");
verstuur = document.getElementById("verstuur-knop");

bug_titel = document.getElementById("bug-titel");
bug_actie = document.getElementById("bug-actie");
bug_gebeurd = document.getElementById("bug-gebeurd");
bug_verwacht = document.getElementById("bug-verwacht");
bug_pagina = document.getElementById("bug-pagina");
bug_formulier = document.getElementById("bug-formulier");
bug_verstuur = document.getElementById("bug-verstuur-knop");

suggestie_titel = document.getElementById("suggestie-titel");
suggestie_tekst = document.getElementById("suggestie-tekst");
suggestie_formulier = document.getElementById("suggestie-formulier");
suggestie_verstuur = document.getElementById("suggestie-verstuur-knop");

feedback_type_selectie = document.getElementById("feedback-type-selectie");

formulieren = [formulier, bug_formulier, suggestie_formulier];

/**
 * Zet alle waardes in invoervelden om naar een feedback-object, dat in de github issues kan worden geplaatst.
 * Geeft null terug als de feedback niet volledig is ingevuld (de verplichte velden)
 * 
 * @returns {object?} - Een object met alle velden die een bepaalde feedback hoort te hebben.
 */
function maak_feedback_bericht() {
    if (verstuur.disabled)
        return null;
    if (!formulier.checkValidity())
        return null;

    let feedback = {};

    feedback.titel = feedback_titel.value;
    feedback.bericht = `Van: **${localStorage.getItem("gebruikersnaam")}**\n\n`;
    feedback.bericht += feedback_tekst.value;
    feedback.bericht += "\n@goedestudent";

    return feedback;
}

/**
 * Zet alle waardes in invoervelden om naar een bug-object, dat in de github issues kan worden geplaatst.
 * Geeft null terug als de bug niet volledig is ingevuld (de verplichte velden)
 * 
 * @returns {object?} - Een object met alle velden die een bug hoort te hebben.
 */
 function maak_bug_bericht() {
    if (bug_verstuur.disabled)
        return null;
    if (!bug_formulier.checkValidity())
        return null;

    let feedback = {};

    feedback.titel = bug_titel.value;
    feedback.bericht = `Van: **${localStorage.getItem("gebruikersnaam")}**\n`;

    // Met de # wordt het in github als een titeltje geplaatst
    feedback.bericht += "\n# Wat probeerde je te doen?\n";
    // Met de > wordt het in github als een quote geplaatst
    feedback.bericht += ">" + bug_actie.value.replaceAll("\n", "\n> ");

    feedback.bericht += "\n# Wat gebeurde er toen?\n";
    feedback.bericht += ">" + bug_gebeurd.value.replaceAll("\n", "\n> ");

    feedback.bericht += "\n# Wat verwachtte je dat er zou gebeuren?\n";
    feedback.bericht += ">" + bug_verwacht.value.replaceAll("\n", "\n> ");

    if (bug_pagina.value) {
        feedback.bericht += "\n# Op welke pagina gebeurde dat?\n";
        feedback.bericht += ">" + bug_pagina.value;
    }

    feedback.bericht += "\n\n@goedestudent";

    feedback.labels = ["bug"];

    return feedback;
}

/**
 * Zet alle waardes in invoervelden om naar een suggestie-object, dat in de github issues kan worden geplaatst.
 * Geeft null terug als de suggestie niet volledig is ingevuld (de verplichte velden)
 * 
 * @returns {object?} - Een object met alle velden die een bepaalde suggestie hoort te hebben.
 */
 function maak_suggestie_bericht() {
    if (suggestie_verstuur.disabled)
        return null;
    if (!suggestie_formulier.checkValidity())
        return null;

    let feedback = {};

    feedback.titel = suggestie_titel.value;
    feedback.bericht = `Van: **${localStorage.getItem("gebruikersnaam")}**\n\n`;
    feedback.bericht += suggestie_tekst.value;
    feedback.bericht += "\n\n@goedestudent";

    feedback.labels = ["enhancement"]

    return feedback;
}

/**
 * Stuurt de ingevulde feedback door naar de server.
 * @param {Event}    event        - Klik event, voor als er op de knop wordt gedrukt.
 * @param {Function} maak_bericht - Functie die het juiste formulier omzet tot een bericht.
 * @returns {Promise} - Promise, die de afhandeling van de upload omvat.
 */
function sla_feedback_op(event, maak_bericht) {
    let verstuur = event.target;
    let feedback = maak_bericht();
    if(feedback != null) {
        event.preventDefault();

        // Als één van de stappen mislukt, moet de knop weer geactiveerd worden
        function fout_bij_versturen() {
            verstuur.disabled = false;
            verstuur.innerText = "versturen";
        }

        verstuur.disabled = true;
        verstuur.innerText = "aan het versturen...";
        stuur_feedback(feedback.titel, feedback.bericht, feedback.labels).catch(fout_bij_versturen).then(() => {
            // Versturen was succesvol
            verstuur.innerText = "verstuurd";
            alert("Het versturen is gelukt!");
            ga_naar_pagina("/feedback");
        });
    }
}

/**
 * Opent het formulier dat momenteel geselecteerd is. Daarnaast sluit het het formulier dat al open stond. 
 */
function open_geselecteerd_formulier() {
    formulieren.forEach(formulier => {
        try {
            if (formulier.id === `${feedback_type_selectie.value}-formulier`) {
                formulier.style.display = "";
            } else {
            formulier.style.display = "none";
            }
        } catch (error) {
            console.error(error);
        }
    })
}

verstuur.addEventListener("click", (event) => sla_feedback_op(event, maak_feedback_bericht));
bug_verstuur.addEventListener("click", (event) => sla_feedback_op(event, maak_bug_bericht));
suggestie_verstuur.addEventListener("click", (event) => sla_feedback_op(event, maak_suggestie_bericht));

feedback_type_selectie.addEventListener("change", open_geselecteerd_formulier);

initialiseer_invoeren();

// Maakt alle formulieren onzichtbaar.
// Als het fout gaat, zet hij de foutmelding in de console.
formulieren.forEach(formulier => {
    try {
        formulier.style.display = "none"
    } catch (error) {
        console.error(error);
    }
});

open_geselecteerd_formulier();