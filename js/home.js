receptenlijst = document.getElementById("recept-kaarten");
zoekbalk_invoer = document.getElementById("recept-zoekbalk");
zoekbalk_plaatje = document.getElementById("zoekbalk-plaatje");
zoekbalk_receptnaam = document.getElementById("zoekbalk-recept-naam");

if (query_parameters.zoek) {
    zoekbalk_invoer.value = query_parameters.zoek;
}

// Hierin wordt opgeslagen op welk recept er geklikt is, en hoe ver de paginas geopend zijn. 
// Als je dan naar de vorige pagina gaat vanaf een recept, ben je weer waar je gebleven was.
geschiedenis_state = history.state ?? { geklikte_recept: null, geklikte_lijst: null, geopende_paginas: {} };

/**
 * Haalt te ingevoerde zoekterm op, en geeft deze door aan de zoek waarde in de URL.
 */
function zoek_recept() {
    ga_naar_pagina(`/?zoek=${zoekbalk_invoer.value}`);
}

/**
 * Event handler voor als er in de zoekbalk op een toets wordt gedrukt.
 * Kijkt of deze toets enter is. Als het enter is, wordt zoek_recept aangeroepen.
 * 
 * @param {Event} event - KeyUp event
 */
function zoekbalk_toets(event) {
    if (event.key === "Enter") {
        zoek_recept();
    }
}

/**
 * Maakt een div aan voor een bepaald gegeven, zoals de kooktijd.
 * 
 * @param {string} plaatje - Emoji die voor de tekst staat
 * @param {string} waarde  - Tekst die naast de emoji staat
 * @returns {HTMLElement}  - Element met het gegeven
 */
function maak_recept_gegeven(plaatje, waarde) {
    // Als de waarde leeg is, moet er geen element gemaakt worden. Daarom stoppen we meteen met
    // de functie, en geven we een leeg object terug.
    if (!waarde) {
        // We moeten een element retourneren, anders gaat de appendChild in `maak_kaart` fout.
        return document.createElement("div");
    }
    let gegeven = document.createElement("div");

    let plaatjeElement = document.createElement("span");
    plaatjeElement.innerText = plaatje + " ";

    let waardeElement = document.createElement("span");
    waardeElement.classList.add("recept-bereidingstijd");
    waardeElement.innerText = waarde;

    gegeven.appendChild(plaatjeElement);
    gegeven.appendChild(waardeElement);

    return gegeven;
}

/**
 * Maakt een kaart aan met de gegevens van het gegeven recept.
 * 
 * @param {object} recept - Recept waar kaart van gemaakt moet worden
 * @returns {HTMLElement} - Kaart met gegevens van het recept
 */ 
function maak_kaart(recept) {
    let houder = document.createElement("div");
    houder.classList.add("recept-kaart-houder");

    let kaart = document.createElement("a");
    kaart.classList.add("recept-kaart");
    kaart.href = `/recept/${recept.link}`;
    kaart.addEventListener("mousedown", () => {
        geschiedenis_state.geklikte_recept = recept.link;
        history.replaceState(geschiedenis_state, null);
    });

    let plaatje_houder = document.createElement("div");
    plaatje_houder.classList.add("recept-plaatje-houder");

    let plaatje = document.createElement("img");
    plaatje.classList.add("recept-plaatje");
    // Het downloaden van de foto is een speciaal geval. We moeten wachten tot de foto gedownload is.
    download_foto(recept.foto).then(
        function foto_gedownload(foto) {
            plaatje.src = foto;
        }
    );
    plaatje.alt = `Foto van ${recept.naam}`;
    plaatje_houder.appendChild(plaatje);

    let gegevens = document.createElement("div");
    gegevens.classList.add("recept-gegevens");
    gegevens.appendChild(maak_recept_gegeven("\ud83d\udd51", recept.tijd));
    gegevens.appendChild(maak_recept_gegeven("\u2B50", bereken_score(recept)));

    let naam = document.createElement("span");
    naam.classList.add("recept-naam")
    naam.innerText = recept.naam;

    kaart.appendChild(plaatje_houder);
    kaart.appendChild(gegevens);
    kaart.appendChild(naam);

    houder.appendChild(kaart);

    return houder;
}

/**
 * Zet de gegeven recepten in de gegeven receptenlijst, waarbij er op elke pagina een gegeven aantal recepten staat.
 * 
 * @param {{naam : string, lijst : HTMLElement}} receptenlijst 
 *                                         - Lijst op de pagina waar de kaarten voor de recepten in geplaatst moeten wrorden
 * @param {[Object]}      recepten         - Lijst met recept-objecten
 * @param {number | null} items_per_pagina - Hoe veel items er op één pagina moeten staan. Null betekent dat alle recepten in de lijst staan.
 */
async function laat_kaarten_zien(receptenlijst, recepten, items_per_pagina=6) {
    // Eerst de naam en lijst uit het object halen
    let lijst_naam = receptenlijst.naam;
    receptenlijst = receptenlijst.lijst;

    // Eerst alle kaarten verwijderen
    while(receptenlijst.children.length > 0) {
        receptenlijst.removeChild(receptenlijst.firstChild);
    }

    // Dit is een container om de knop heen, zodat de knop op het midden van de pagina komt te staan
    let uitbreidknop_container = document.createElement("div");
    uitbreidknop_container.classList.add("recept-kaarten-uitbreidknop-container");

    // Uitbreidknop, die gebruikt kan worden om meer recepten te laden
    let uitbreidknop = document.createElement("button");
    uitbreidknop.classList.add("recept-kaarten-uitbreidknop");

    let pijltje = document.createElement("span");
    pijltje.classList.add("recept-kaarten-uitbreidknop-icoon");

    uitbreidknop.appendChild(pijltje);
    uitbreidknop_container.appendChild(uitbreidknop);
    receptenlijst.after(uitbreidknop_container);

    // Als items_per_pagina null of undefined is, dan wordt het ingesteld op het aantal recepten dat er is
    if (!items_per_pagina) {
        items_per_pagina = recepten.length;
    }

    // Van alle overgebleven recepten maken we een kaart
    // Hier doe ik iets wat normaal niet gebeurd: ik haal de declaratie van de iteratie-variabele naar buiten de for.
    // Dan kan hij gebruikt worden buiten de loop, om de lijst verder aan te vullen
    let index = 0;

    // Hier maken we een functie, die gebruikt kan worden om de volgende pagina in te laden
    function vul_lijst_verder() {
        // Aantal elementen dat momenteel in de lijst mag staan
        let huidigMaximum = Math.min(recepten.length, index + items_per_pagina);
        for(; index < huidigMaximum; index++) {
            const recept = recepten[index];
            // Omdat elke kaart een plaatje moet downloaden, moeten we expliciet wachten tot de kaart gemaakt is.
            kaart = maak_kaart(recept);
            receptenlijst.appendChild(kaart);

            // Check of er op dit recept geklikt was. Als dat zo is, maken we hem zichtbaar op het scherm.
            if (recept.link == geschiedenis_state.geklikte_recept && lijst_naam == geschiedenis_state.geklikte_lijst) {
                kaart.scrollIntoView();
            }
        }

        // Als we nu alle recepten hebben geplaatst, kunnen we de knop weghalen.
        // Let op dat de knop op het pagina-element geplaatst is, dus we moeten hem daar ook verwijderen.
        if (index == recepten.length) {
            document.getElementById("pagina").removeChild(uitbreidknop_container);
        }

        // Sla op dat de lijst tot hier open stond
        geschiedenis_state.geopende_paginas[lijst_naam] = Math.ceil(huidigMaximum / items_per_pagina);
        history.replaceState(geschiedenis_state, null);
    }
    
    // Als de lijst niet in de geschiedenis zit, dan moet er standaard 1 pagina getoond worden
    if (!geschiedenis_state.geopende_paginas[lijst_naam]) {
        geschiedenis_state.geopende_paginas[lijst_naam] = 1;
    }
    let open_paginas = geschiedenis_state.geopende_paginas[lijst_naam];

    // Vul de lijst met de eerste elementen
    for (let index = 0; index < open_paginas; index++) {
        vul_lijst_verder();
    }

    // Als op de knop wordt gedrukt moet de lijst verder worden gevuld
    uitbreidknop.onclick = vul_lijst_verder;

    // Als er geen recepten overblijven, zetten we dat op de pagina
    if (recepten.length == 0) {
        const foutmelding = document.createElement("h1");
        foutmelding.innerText = "Geen recepten gevonden";
        receptenlijst.appendChild(foutmelding);
    }
}

/**
 * Geeft alleen die recepten uit het gegeven receptenboek terug, waar de zoekterm
 * in de naam zit, of in de ingredientenlijst.
 * 
 * @param {object[]} receptenboek - Lijst met recepten
 * @param {string} zoekterm - Term om op te zoeken
 * @returns {object[]} - Alle recepten uit het receptenboek die voldoen aan de zoekterm
 */
function filter_recepten(receptenboek, zoekterm) {
    zoekterm = zoekterm.toLowerCase();
    return receptenboek.filter(recept => 
        // Een recept heeft de zoekterm in de naam
        recept.naam.toLowerCase().indexOf(zoekterm) > -1 ||
        // Een ingredient heeft de zoekterm in de naam
        recept.ingredienten.some(ingredient => ingredient.naam.toLowerCase().indexOf(zoekterm) > -1) ||
        // Een van de gangen heeft de zoekterm in de naam
        (recept.menu_gang ?? []).some(gang => gang.toLowerCase().indexOf(zoekterm) > -1)
    );
}

/**
 * Maakt een nieuwe lijst aan om receptkaarten in te plaatsen. Erboven wordt de gegeven naam weergegeven.
 * 
 * @param {string} naam   - Naam van de lijst. Deze komt boven de lijst te staan
 * @returns {HTMLElement} - Het element van de lijst
 */
function nieuwe_recepten_lijst(naam) {
    let lijst_titel = document.createElement("h2");
    lijst_titel.classList.add("recept-kaarten-titel");
    lijst_titel.innerText = naam;

    let lijst = document.createElement("section");
    lijst.classList.add("recept-kaarten");
    lijst.addEventListener("mousedown", () => {
        geschiedenis_state.geklikte_lijst = naam;
        history.replaceState(geschiedenis_state, null);
    });

    // In het "pagina" element komt telkens de huidige pagina te staan (home, recept, recept maken).
    // Daarom moeten we hem daar aan toevoegen. Anders verdwijnt de lijst niet als we naar een andere pagina gaan.
    document.getElementById("pagina").appendChild(lijst_titel);
    document.getElementById("pagina").appendChild(lijst);

    return {naam, lijst};
}

/**
 * Haalt het recept op dat voor vandaag wordt weergegeven in de zoekbalk.
 * 
 * @returns {object} - Recept corresponderend met vandaag
 */ 
function recept_van_de_dag() {
    const nu = new Date();
    const begin_van_het_jaar = new Date(nu.getFullYear(), 0, 0);
    const millisecondes_naar_dagen = 1000 * 60 * 60 * 24;

    const dag = Math.floor((nu - begin_van_het_jaar) / millisecondes_naar_dagen);
    
    const receptIndex = dag % receptenboek.length;

    return receptenboek[receptIndex];
}

async function laat_recept_van_de_dag_zien() {
    const recept = recept_van_de_dag();
    if (!recept) {
        // Er ging iets mis bij het laden van het recept van de dag. Daarom stoppen we de functie.
        return;
    }
    zoekbalk_receptnaam.innerText = recept.naam;
    zoekbalk_receptnaam.href = `recept/${recept.link}`;
    zoekbalk_plaatje.alt = `Foto van ${recept.naam}`;

    // Het downloaden van de foto is een speciaal geval. We moeten nu wachten tot de foto gedownload is.
    let foto = await download_foto(recept.foto);
    zoekbalk_plaatje.src = foto;
}

/**
    * Haalt het receptenboek op van de server.
    * Laat vervolgens alle recepten in een lijst zien.
    * Daarna wordt het plaatje bij de zoekbalk geupdate om het recept van de dag te tonen.
    */
haal_recepten_op().then(() => {
        laat_recept_van_de_dag_zien();

        // Als er iets gezocht wordt, willen we alleen een lijst met gevonden recepten
        if (query_parameters.zoek) {
            // We halen alle recepten weg die niet aan de zoekterm voldoen
            recepten = filter_recepten(receptenboek, query_parameters.zoek);
            laat_kaarten_zien(nieuwe_recepten_lijst("Zoekresultaten"), recepten, undefined);
            
            // Return, zodat er geen andere lijsten worden weergegeven
            return;
        }

        // Met [...receptenboek] maken we een lijst, waar alle elementen van receptenboek in komen te staan. Het is dus eigenlijk een kopie.
        // Omdat reverse "in place" werkt (d.w.z. dat de originele lijst wordt aangepast), moeten we een kopie omdraaien. Als we dat niet zouden doen,
        // dan is receptenboek de volgende keer dat we hem gebruiken de omgedraaide lijst.
        laat_kaarten_zien(nieuwe_recepten_lijst("Nieuwste recepten"), [...receptenboek].reverse());

        laat_kaarten_zien(nieuwe_recepten_lijst("Lekker voor tussendoor"), receptenboek.filter((recept) => 
            (recept.menu_gang ?? []).some((gang) => gang.toLowerCase().indexOf("tussendoortje") > -1)
        ));

    }
);