labels = document.querySelectorAll("label");
naam = document.getElementById("recept-naam");
omschrijving = document.getElementById("recept-omschrijving");
tijd = document.getElementById("recept-tijd");
porties = document.getElementById("recept-porties");
eerst_gemaakt = document.getElementById("recept-eerst-gemaakt");
review_score = document.getElementById("recept-score");
review_tekst = document.getElementById("recept-review");
ingredienten_lijst = document.getElementById("recept-ingredienten");
bereiding_lijst = document.getElementById("recept-bereiding");
suggestie_lijst = document.getElementById("recept-suggesties");
opslaan = document.getElementById("opslaan-knop");
formulier = document.getElementById("recept-formulier");
formulier_receptgegevens = document.getElementById("recept-formulier-receptgegevens");
foto = document.getElementById("recept-foto");
menu_gang_lijst = document.getElementById("recept-menu-gang-lijst");

// Lijst van alle gangen die we toevoegen
recept_gangen = ["Hoofdgerecht", "Voorgerecht", "Soep", "Toetje", "Tussendoortje", "Drankje", "Ontbijt"];

ingredienten = 0;
bereiding_stappen = 0;
suggesties = 0;

// Slaat alle invoervelden op, zodat we er straks makkelijk bij kunnen
ingredient_invoervelden = [];
bereiding_invoervelden = [];
suggestie_invoervelden = [];
menu_gang_invoervelden = []

plaatje = undefined;

recept_foto_link = undefined;

// Als we een recept bewerken, staat hier het originele recept in
originele_recept = undefined;

/**
 * Maakt een nieuwe invoer voor een ingredient aan.
 * 
 * @param {{hoeveelheid: number, naam: string}?} - Waardes om in te vullen in de invoeren.
 * @returns {HTMLElement} - Item dat in de lijst met ingrediënt-invoeren kan worden geplaatst
 */
function nieuw_ingredient(waarde = undefined) {
    let ingredient_item = document.createElement("li");
    let ingredient_nummer = ++ingredienten;

    let naam_id = `recept-ingredient-${ingredient_nummer}`;
    let hoeveelheid_id = `recept-ingredient-aantal-${ingredient_nummer}`;

    let combinatie = document.createElement("div");
    combinatie.classList.add("invoer-met-label");

    let label_van_naam = document.createElement("label");
    label_van_naam.for = naam_id;
    label_van_naam.innerText = "Eenheid en product";

    let ingredient_naam = document.createElement("input");
    ingredient_naam.id = naam_id;
    ingredient_naam.placeholder = "gram komkommer";

    let label_van_hoeveelheid = document.createElement("label");
    label_van_hoeveelheid.for = hoeveelheid_id;
    label_van_hoeveelheid.innerText = "Hoeveelheid";

    let ingredient_hoeveelheid = document.createElement("input");
    ingredient_hoeveelheid.id = hoeveelheid_id;
    ingredient_hoeveelheid.placeholder = "100";

    if (waarde) {
        if (waarde.hoeveelheid)
            ingredient_hoeveelheid.value = waarde.hoeveelheid;
        if (waarde.naam)
            ingredient_naam.value = waarde.naam;
    }

    // Dit zorgt er voor dat als dit ingrediënt het laatste in de lijst is, en er in getypt wordt,
    // dat er dan een nieuwe invoer onder verschijnt, om een nieuwe ingrediënt in te zetten.
    ingredient_naam.addEventListener("input", () => {
        if (ingredient_nummer === ingredienten) {
            ingredienten_lijst.appendChild(nieuw_ingredient());
        }

        // Zorgt er voor dat als alle tekst wordt weggehaald, er een streep door het label komt.
        // Dit om aan te geven dat het veld niet in het receptenboek zal verschijnen.
        label_van_naam.style = "";
        label_van_hoeveelheid.style = "";
        if(ingredient_naam.value === "" && ingredient_hoeveelheid.value === "") {
            label_van_naam.style = "text-decoration: line-through";
            label_van_hoeveelheid.style = "text-decoration: line-through"
        }
    });

    ingredient_invoervelden.push([ingredient_naam, ingredient_hoeveelheid]);

    combinatie.appendChild(label_van_hoeveelheid);
    combinatie.appendChild(ingredient_hoeveelheid);
    combinatie.appendChild(label_van_naam);
    combinatie.appendChild(ingredient_naam);

    ingredient_item.appendChild(combinatie);

    return ingredient_item;
}

/**
 * Maakt een nieuwe invoer voor een stap van de bereiding aan.
 * 
 * @param {string?} - Eventuele waarde om alvast in te vullen
 * @returns {HTMLElement} - Item dat in de lijst met bereiding-invoeren kan worden geplaatst
 */
function nieuwe_bereiding_stap(waarde = undefined) {
    let bereiding_item = document.createElement("li");
    let bereiding_nummer = ++bereiding_stappen;

    let id = `recept-bereiding-${bereiding_nummer}`;

    let combinatie = document.createElement("div");
    combinatie.classList.add("invoer-met-label");

    let label_van_stap = document.createElement("label");
    label_van_stap.for = id;
    label_van_stap.innerText = `Stap ${bereiding_nummer}`;

    let bereiding = document.createElement("textarea");
    bereiding.id = id;
    bereiding.placeholder = "Snijd de komkommer in stukjes";
    pas_automatisch_grootte_aan(bereiding);

    if(waarde)
        bereiding.value = waarde;

    // Dit zorgt er voor dat als deze stap de laatste in de lijst is, en er in getypt wordt,
    // dat er dan een nieuwe invoer onder verschijnt, om een nieuwe stap in te zetten.
    bereiding.addEventListener("input", () => {
        if (bereiding_nummer === bereiding_stappen) {
            bereiding_lijst.appendChild(nieuwe_bereiding_stap());
        }

        // Zorgt er voor dat als alle tekst wordt weggehaald, er een streep door het label komt.
        // Dit om aan te geven dat het veld niet in het receptenboek zal verschijnen.
        label_van_stap.style = "";
        if(bereiding.value === "") {
            label_van_stap.style = "text-decoration: line-through";
        }
    });

    bereiding_invoervelden.push(bereiding);

    combinatie.appendChild(label_van_stap);
    combinatie.appendChild(bereiding);

    bereiding_item.appendChild(combinatie);

    return bereiding_item;
}

/**
 * Maakt een nieuwe invoer voor een suggestie aan.
 * 
 * @param {string?} - Eventuele waarde om alvast in te vullen
 * @returns {HTMLElement} - Item dat in de lijst met suggestie-invoeren kan worden geplaatst
 */
 function nieuwe_suggestie(waarde = undefined) {
    let suggestie_item = document.createElement("li");
    let suggestie_nummer = ++suggesties;

    let id = `recept-suggestie-${suggestie_nummer}`;

    let combinatie = document.createElement("div");
    combinatie.classList.add("invoer-met-label");

    let label_van_suggestie = document.createElement("label");
    label_van_suggestie.for = id;
    label_van_suggestie.innerText = `Suggestie/weetje ${suggestie_nummer}`;

    let suggestie = document.createElement("textarea");
    suggestie.id = id;
    suggestie.placeholder = "Lekker te combineren met een Mojito!";
    pas_automatisch_grootte_aan(suggestie);

    if(waarde)
        suggestie.value = waarde;

    // Dit zorgt er voor dat als deze stap de laatste in de lijst is, en er in getypt wordt,
    // dat er dan een nieuwe invoer onder verschijnt, om een nieuwe stap in te zetten.
    suggestie.addEventListener("input", () => {
        if (suggestie_nummer === suggesties) {
            suggestie_lijst.appendChild(nieuwe_suggestie());
        }

        // Zorgt er voor dat als alle tekst wordt weggehaald, er een streep door het label komt.
        // Dit om aan te geven dat het veld niet in het receptenboek zal verschijnen.
        label_van_suggestie.style = "";
        if(suggestie.value === "") {
            label_van_suggestie.style = "text-decoration: line-through";
        }
    });

    suggestie_invoervelden.push(suggestie);

    combinatie.appendChild(label_van_suggestie);
    combinatie.appendChild(suggestie);

    suggestie_item.appendChild(combinatie);

    return suggestie_item;
}

/**
 * Maakt een nieuw item aan in de lijst met gangen, waarbij de gang de gegeven naam krijgt.
 * 
 * @param {string} gangnaam - Naam van de nieuwe gang
 * @returns {HTMLElement}   - Het invoerveld van de nieuwe gang
 */
function zet_gang_in_lijst(gangnaam) {
    let lijst_item = document.createElement("li");
    lijst_item.classList.add("recept-menu-gang-lijst-item");

    let invoer_naam = `recept-menu-gang-${gangnaam}`;

    // Dit is de checkbox
    let invoer = document.createElement("input");
    invoer.classList.add("recept-menu-gang");
    invoer.type = "checkbox";
    invoer.id = invoer_naam;
    invoer.name = gangnaam;

    // De checkbox toevoegen aan de lijst, zodat we later makkelijker kunnen kijken wat er allemaal aangevinkt is
    menu_gang_invoervelden.push(invoer);

    // Label naast de checkbox
    let label = document.createElement("label");
    label.innerText = gangnaam;
    label.for = invoer_naam;

    // Het item op de pagina zetten
    lijst_item.appendChild(invoer);
    lijst_item.appendChild(label);
    menu_gang_lijst.appendChild(lijst_item);

    return invoer;
}

/**
 * Zet alle waardes in invoervelden om naar een recept-object, dat in het receptenboek kan worden geplaatst.
 * Geeft null terug als het recept niet volledig is ingevult (de verplichte velden)
 * 
 * @returns {object?} - Een object met alle velden die een recept hoort te hebben.
 */
function maak_recept() {
    if (!formulier.checkValidity())
        return null;

    let recept = {};

    try {
        document
            .querySelectorAll("input:not([type='file']), textarea")
            .forEach(
                (invoer) => invoer.value = invoer.value.trim()
            );
    
        // Simpele gegevens invullen
        recept.naam = naam.value;
        recept.link = recept.naam.replaceAll(" ", "-").replaceAll("/", "--");
        recept.omschrijving = omschrijving.value;
        recept.eerst_gemaakt = eerst_gemaakt.value;
        recept.porties = porties.value;
        recept.tijd = tijd.value;
        recept.ingredienten = [];
        recept.bereiding = [];
        recept.suggesties = [];
        recept.menu_gang = [];
        if (recept_foto_link)
            recept.foto = recept_foto_link;
    
        // Reviews uit het originele recept overzetten, zodat de review van de ander
        // niet wordt verwijderd bij een update.
        // Als je je review hebt aangepast, wordt dat hieronder nog overschreven.
        if (originele_recept) {
            recept.reviews = originele_recept.reviews;
        }
        if (!recept.reviews) {
            recept.reviews = {};
        }
    
        // Ingredienten toevoegen
        for (let index = 0; index < ingredient_invoervelden.length; index++) {
            const [ingredient, hoeveelheid] = ingredient_invoervelden[index];
            if (ingredient.value !== "") {
                recept.ingredienten.push({
                    naam: ingredient.value,
                    // Stel hoeveelheid in op undefined als het invoerveld leeg is, stel het anders in op de ingevulde waarde
                    hoeveelheid: hoeveelheid.value == "" ? undefined : hoeveelheid.value
                })
            }
        }
    
        // Bereidingstappen toevoegen
        for (let index = 0; index < bereiding_invoervelden.length; index++) {
            const stap = bereiding_invoervelden[index];
            if (stap.value !== "") {
                recept.bereiding.push(stap.value);
            }
        }
    
        // Extra feitjes en suggesties toevoegen
        for (let index = 0; index < suggestie_invoervelden.length; index++) {
            const suggestie = suggestie_invoervelden[index];
            if (suggestie.value !== "") {
                recept.suggesties.push(suggestie.value);
            }
        }
    
        // Geselecteerde gangen toevoegen
        for (let index = 0; index < menu_gang_invoervelden.length; index++) {
            const gang_invoerveld = menu_gang_invoervelden[index];
            
            if (gang_invoerveld.checked) {
                recept.menu_gang.push(gang_invoerveld.name);
            }
        }
    
        let review;
    
        // Als er niets meer is ingevuld, moet de oude review worden weggehaald. Daarom alleen de review invullen
        // als er iets in de invoervelden staat
        if (review_score.value != "" || review_tekst.value != "") {
            review = {
                score: review_score.value,
                reden: review_tekst.value
            }
        }
    
        let gebruikersnaam = localStorage.getItem("gebruikersnaam");
        // De (eventueel aangepaste) review in het recept zetten
        if (review)
            recept.reviews[gebruikersnaam] = review;
        else
            delete recept.reviews[gebruikersnaam];
    } catch (error) {
        // Sla het recept dat nu wordt gemaakt tijdelijk op, zodat ingevulde gegevens hopelijk niet verloren gaan
        localStorage.setItem("huidig-recept", JSON.stringify(recept));
        throw error;
    }


    return recept;
}

/**
 * Slaat de ingevulde waarden op in het receptenboek, en stuurt die update naar de server.
 * Wanneer alles goed gaat, wordt de gebruiker gestuurt naar het zojuist aangemaakte recept.
 * @param {Event} event - Klik event, voor als er op de knop wordt gedrukt.
 * @returns {Promise} - Promise, die de afhandeling van de upload omvat.
 */
function sla_recept_op(event) {
    if (opslaan.disabled)
        return;
    if (!formulier.checkValidity())
        return;

    event.preventDefault();
    
    let recept = maak_recept();

    // Sla het recept dat nu wordt gemaakt tijdelijk op, zodat het niet verloren gaat als er iets mis gaat op de server.
    localStorage.setItem("huidig-recept", JSON.stringify(recept));

    if (recept != null) {

        if (!originele_recept) {
            // Als er al een recept met deze link is, zet dan de huidige tijd voor de link
            while (receptenboek.some(boekrecept => boekrecept.link == recept.link )) {
                recept.link = new Date().getTime() + "-" + recept.link;
            }
        }

        // Als één van de stappen mislukt, moet de knop weer geactiveerd worden
        function fout_bij_opslaan() {
            opslaan.disabled = false;
            opslaan.innerText = "opslaan";
            alert("Er deed zich een probleem voor bij het opslaan van het recept.\nAls dit probleem zich voor blijft doen, stuur dan het bestand uit de accountinstellingen door.\n\n Doe dit vóór het aanmaken of wijzigen van een nieuw recept.");
        }
        
        opslaan.disabled = true;
        opslaan.innerText = "Aan het opslaan...";
        
        upload_plaatje(recept).then((foto_recept) => {
            haal_receptenboek_sha_op().then( (sha) => {
                haal_recepten_op(true).then( () => {
                    // Eerst maken we een kopie van het receptenboek
                    let nieuw_boek = JSON.parse(JSON.stringify(receptenboek));

                    // Als we het originele recept kunnen vinden, vervangen we het'
                    if (originele_recept) {
                        // Omdat objecten in JavaScript raar werken, moeten we het recept even opzoeken in het nieuwe boek.
                        let originele_recept_in_nieuw_boek = nieuw_boek.find((boekrecept) => boekrecept.link == originele_recept.link);
                        if (originele_recept_in_nieuw_boek) {
                            nieuw_boek[nieuw_boek.indexOf(originele_recept_in_nieuw_boek)] = foto_recept;
                        } else {
                            nieuw_boek.push(foto_recept);
                        }
                    } else {
                        // Anders dan zetten we het nieuwe recept erin
                        nieuw_boek.push(foto_recept);
                    }

                    // Nu sturen we deze update naar de server
                    let data_voor_server = JSON.stringify(nieuw_boek, null, 4);

                    // Maak er een blob van, dan kunnen we het omzetten naar base64
                    data_voor_server = new Blob([data_voor_server], {type : 'application/json'});

                    // Het nieuwe receptenboek kan nu naar de server worden gestuurd.
                    stuur_data(data_voor_server, "recepten.json", `Recept voor ${recept.naam} ${originele_recept ? "aangepast" : "aangemaakt"}`, sha).then ( () => {
                        haal_recepten_op(true).then (() => {
                            ga_naar_pagina(`/recept/${recept.link}`);
                            localStorage.setItem("huidig-recept", "");
                        });
                    }).catch(fout_bij_opslaan);
                }).catch(fout_bij_opslaan);
            }).catch(fout_bij_opslaan);
        }).catch(fout_bij_opslaan);
    }
}

/**
 * Event handler voor als een foto geupload wordt. Zal het bestand tijdelijk opslaan in de 'plaatje' variabele.
 * @param {Event} event - Change event van de invoer voor bestanden.
 */
function plaatje_geupload(event) {
    const element = event.target;
    element.classList.remove("succesvol");

    plaatje = undefined;
    recept_foto_link = undefined;
    let bestand = element.files[0];
    plaatje = bestand;
    element.classList.add("succesvol");
}

/**
 * Als het recept nog geen foto heeft, en er een foto is geüpload, dan wordt de foto naar de server gestuurd.
 * Geeft een recept terug met de link naar het geüploadde plaatje.
 * 
 * @param {object} recept - Recept waarvoor plaatje geüpload wordt
 * @returns {Promise}
 */
function upload_plaatje(recept) {
    if (recept.foto || !plaatje) {
        return new Promise((gelukt) => gelukt(recept));
    } else {
        // Haal de bestandsextensie van de upload af, zodat we hem naar de server door kunnen sturen.
        let extensie = plaatje.name.match(/\.[a-zA-Z]*$/g);
        let plaatje_bestands_naam = recept.link + extensie;

        let haal_foto_sha_op;

        // Als we een recept updaten, en dat recept al een foto had, dan moeten we het plaatje vervangen.
        // We moeten dan eerst de sha ophalen.
        if (originele_recept && originele_recept.foto) {
            haal_foto_sha_op = haal_sha_op(`${SERVER_LINK_BEGIN}/contents/${plaatje_bestands_naam}`)
                .catch(() => {}); // We negeren het scenario waarin het mis gaat, omdat dit ook kan betekenen dat de extensie nu anders is dan de vorige keer.
                                  // Dit is in principe geen probleem
        } else {
            haal_foto_sha_op = new Promise((gelukt) => gelukt());
        }

        return haal_foto_sha_op.then((sha) => 
            {
                // Wat er precies gebeurd is met het plaatje.
                // Als er een sha is, dan is bij geüpdate, anders is hij nu aangemaakt.
                let operatie = sha ? "bijgewerkt" : "aangemaakt";
                return stuur_data(plaatje, plaatje_bestands_naam, `Plaatje voor recept ${recept.naam} ${operatie}`, sha).then((verzoekTekst) => {
                    let verzoekData = JSON.parse(verzoekTekst);
                    recept.foto = verzoekData.content.url;
                    recept_foto_link = verzoekData.content.url;
                    return recept;
                });
            }
        );
    }
}

opslaan.addEventListener("click", sla_recept_op);
foto.addEventListener("change", plaatje_geupload);
initialiseer_invoeren();

// Maak een checkbox aan voor elke gang in de lijst "recept_gangen"
recept_gangen.forEach(zet_gang_in_lijst);

haal_recepten_op().then( () => {
    formulier_receptgegevens.style.display = "unset";

    open_recept(url_parameters.recept);

    ingredienten_lijst.appendChild(nieuw_ingredient());
    bereiding_lijst.appendChild(nieuwe_bereiding_stap());
    suggestie_lijst.appendChild(nieuwe_suggestie());
});

/**
 * Zoekt het recept met de gegeven link, en vult alle waardes in in de invoervelden
 * 
 * @param {string?} link - Link naar het recept om te bewerken
 */
function open_recept(link) {
    if (link) {
        let recept = receptenboek.find(recept => recept.link == link);
        if (recept) {
            // Even handmatig ervoor zorgen dat alle invoervelden groot genoeg worden
            const event = new Event("input");

            naam.value = recept.naam;
            omschrijving.value = recept.omschrijving;
            tijd.value = recept.tijd;
            porties.value = recept.porties;
            eerst_gemaakt.value = recept.eerst_gemaakt;

            omschrijving.dispatchEvent(event);

            if (recept.foto) {
                foto.innerText = "Heeft foto";
                foto.classList.add("succesvol");
                recept_foto_link = recept.foto;
            }

            recept.ingredienten.forEach(ingredient => {
                ingredienten_lijst.appendChild(nieuw_ingredient(ingredient));
            });

            recept.bereiding.forEach(bereiding => {
                let invoer = nieuwe_bereiding_stap(bereiding)
                bereiding_lijst.appendChild(invoer);
                invoer.dispatchEvent(event);
            });

            (recept.suggesties ?? []).forEach(suggestie => {
                let invoer = nieuwe_suggestie(suggestie)
                suggestie_lijst.appendChild(invoer);
                invoer.dispatchEvent(event);
            });

            (recept.menu_gang ?? []).forEach(gang => {
                let invoer = document.querySelector(`input.recept-menu-gang[name=${gang}]`);
                if (!invoer) {
                    // Als een invoer niet bestaat, deze nu aanmaken zodat er geen info verloren gaat
                    invoer = zet_gang_in_lijst(gang);
                }
                invoer.checked = true;
            });

            let gebruikersnaam = localStorage.getItem("gebruikersnaam");

            if ((recept.reviews ?? {})[gebruikersnaam]) {
                review_score.value = recept.reviews[gebruikersnaam].score;
                review_tekst.value = recept.reviews[gebruikersnaam].reden;
            }

            review_tekst.dispatchEvent(event);
            originele_recept = recept;
        }
    }
}