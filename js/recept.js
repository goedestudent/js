// Alle elementen die informatie laten zien opslaan in lokale variabelen, zodat 
// we er straks makkelijk bij kunnen.
// Normaal zou dit met lets gebeuren (b.v. let naam = ...), maar omdat dit op de top-level
// wordt gedeclareerd, geeft dat problemen als de pagina opnieuw wordt geladen, omdat top-level
// variabelen niet worden verwijderd als de <script> wordt verwijderd.
naam = document.getElementById("recept-naam");
omschrijving = document.getElementById("recept-omschrijving");
plaatje = document.getElementById("recept-plaatje");
ingredienten = document.getElementById("ingredienten-lijst");
bereiding = document.getElementById("bereiding-stappen");
suggesties = document.getElementById("suggesties");
suggestie_sectie = document.getElementById("suggestie-sectie");
recept_gegevens = document.getElementById("recept-gegevens");
menu_gang = document.getElementById("recept-menu-gang");
menu_gang_container = document.getElementById("recept-menu-gang-container");
deelknop = document.getElementById("deel-knop");
reviews = document.getElementById("review-sectie");

/**
 * Opent het recept met het gegeven nummer.
 */ 
function open_recept(link) {

    // Specifieke recept opzoeken in het receptenboek
    let recept = receptenboek.find(recept => recept.link === link);

    if (recept == undefined) {
        alert("Recept niet gevonden");
        return;
    }

    let bewerk_link = document.createElement("a");
    bewerk_link.classList.add("normale-tekst")
    bewerk_link.href = `/recept_maken/${recept.link}`;
    bewerk_link.innerText = "✏️";

    // Stel de titel van het tabblad in op de naam van het recept
    verander_tabblad_titel(recept.naam);

    // Alle 'simpele' teksten wegzetten
    naam.innerText = recept.naam;
    naam.appendChild(bewerk_link)
    omschrijving.innerText = recept.omschrijving;
    download_foto(recept.foto).then(
        function als_foto_gedownload(foto) {
            plaatje.src = foto;
        }
    );

    const eerst_gemaakt = document.createElement("span");
    eerst_gemaakt.innerText = recept.eerst_gemaakt ?? ""
    if (!recept.eerst_gemaakt) {
        eerst_gemaakt.innerText = "Niet bekend";
    }

    recept_gegevens.appendChild(maak_recept_gegeven("\ud83d\udc65", recept.porties + (recept.porties ? " personen" : "")));
    recept_gegevens.appendChild(maak_recept_gegeven("\ud83d\udd51", recept.tijd));
    recept_gegevens.appendChild(maak_recept_gegeven("\ud83d\udcc5", eerst_gemaakt.innerText));
    recept_gegevens.appendChild(maak_recept_gegeven("\u2B50", bereken_score(recept)));

    menu_gang.innerText = (recept.menu_gang ?? []).join(", ");

    // Als er geen gangen zijn, zetten we de display op "None". Dat is het hele element niet meer te zien en verdwijnt dus ook de emoji.
    menu_gang_container.style.display = (recept.menu_gang ?? []).length == 0 ? "none" : "";

    // Alle oude items uit de lijsten halen
    while (bereiding.children.length > 0) {
        bereiding.removeChild(bereiding.children[0]);
    }
    while (ingredienten.children.length > 0) {
        ingredienten.removeChild(ingredienten.children[0]);
    }
    while (suggesties.children.length > 0) {
        suggesties.removeChild(suggesties.children[0]);
    }

    // Alle nieuwe items in de lijsten stoppen
    recept.ingredienten.forEach(ingredient => {
        let item = document.createElement("li");
        item.innerText = (ingredient.hoeveelheid ?? "") + " " + ingredient.naam.toLowerCase();
        ingredienten.appendChild(item);
    });

    recept.bereiding.forEach(stap => {
        let item = document.createElement("li");
        item.innerText = stap;
        bereiding.appendChild(item);
    });

    // Als er geen suggesties zijn, willen we standaard de lege lijst gebruiken
    (recept.suggesties ?? []).forEach(suggestie => {
        let item = document.createElement("li");
        item.innerText = suggestie;
        suggesties.appendChild(item);
    });

    // Suggestie sectie alleen laten zien als er echt suggesties of weetjes zijn
    if ((recept.suggesties ?? []).length > 0) {
        suggestie_sectie.style.removeProperty("display")
    } else {
        suggestie_sectie.style.display = "none";
    }

    let reviewers = Object.keys(recept.reviews ?? { });

    for (let index = 0; index < reviewers.length; index++) {
        const reviewer = reviewers[index];
        const review = recept.reviews[reviewer];
        if (recept.reviews[reviewer]) {
            review.reviewer_naam = reviewer;
            voeg_review_toe(review)
        }
    }

    // Als de reviewsectie 1 kind heeft, is dat alleen de titel. In dat geval moeten we even aangeven dat er nog geen recepten zijn.
    if (reviews.children.length == 1) {
        review_tekst = document.createElement("p");
        review_tekst.innerText = "Er zijn nog geen reviews voor dit recept";
        reviews.appendChild(review_tekst);
    }

    // We stellen nu de deelknop in.
    // Eerst kijken we of de standaard deelknop van de browser er is (dat is zo als navigator.share bestaat).
    // Is dat niet het geval, dan maken we de link specifiek voor whatsapp
    if(navigator.share) {
        deelknop.onclick = () => deel_recept(recept);
    } else {
        deelknop.innerText = "Delen via whatsapp";
        deelknop.onclick = () => window.open(`whatsapp://send?text=${encodeURIComponent(maak_deelbaar_bericht(recept))}`);
    }
}

/**
 * Maakt een div aan voor een bepaald gegeven, zoals de kooktijd.
 * 
 * @param   {string} plaatje - Emoji die voor de tekst staat
 * @param   {string} waarde  - Tekst die naast de emoji staat
 * @returns {HTMLElement}    - Element met het gegeven
 */
 function maak_recept_gegeven(plaatje, waarde) {
    // Als de waarde leeg is, moet er geen element gemaakt worden. Daarom stoppen we meteen met
    // de functie, en geven we een leeg object terug.
    if (!waarde) {
        // We moeten een element retourneren, anders gaat de appendChild in `maak_kaart` fout.
        return document.createElement("div");
    }
    let gegeven = document.createElement("div");
    gegeven.classList.add("recept-gegeven");

    let plaatjeElement = document.createElement("span");
    plaatjeElement.innerText = plaatje + " ";

    let waardeElement = document.createElement("span");
    waardeElement.innerText = waarde;

    gegeven.appendChild(plaatjeElement);
    gegeven.appendChild(waardeElement);

    return gegeven;
}

/**
 * Zet de review in de review-sectie van de recept-pagina.
 * 
 * @param {object} review - Review die op de pagina gezet moet worden.
 */
function voeg_review_toe(review) {
    let container = document.createElement("div");
    container.classList.add("review", review.reviewer_naam);

    let profielfoto_container = document.createElement("div");
    profielfoto_container.classList.add("reviewer-avatar");
    container.appendChild(profielfoto_container)
    
    let profielfoto = document.createElement("img");
    profielfoto.alt = `Foto van ${review.reviewer_naam}`;
    download_profielfoto(review.reviewer_naam.toLowerCase()).then((foto) => profielfoto.src = foto);
    profielfoto_container.appendChild(profielfoto);

    let naam = document.createElement("span");
    naam.classList.add("reviewer");
    naam.innerText = review.reviewer_naam;
    container.appendChild(naam);

    let score = document.createElement("span");
    score.classList.add("score");
    score.innerText = review.score;
    container.appendChild(score);

    let review_tekst = document.createElement("pre");
    review_tekst.classList.add("review-tekst");
    review_tekst.innerText = review.reden;
    container.appendChild(review_tekst);

    reviews.appendChild(container);
}

/**
 * Maakt de tekst die gedeeld wordt.
 * 
 * @param   {object} recept  - Recept waarvoor de tekst gemaakt moet worden
 * @returns {string}         - Beschrijving van het recept als tekst
 */
function maak_deelbaar_bericht(recept) {
    return `Wij hebben *${recept.naam}* gemaakt! Wil jij dit ook maken? Dit heb je nodig:\n${recept.ingredienten.map((ingredient) => `${ingredient.hoeveelheid ?? ""} ${ingredient.naam}`).join("\n")}` 
    + `\n\nVervolgens volg je deze stappen:\n${recept.bereiding.map((stap) => "- " + stap).join("\n")}\n\nHet recept vind je ook op https://jammiesmikkel.jaan.pro/recept/${recept.link}`
}

/**
 * Functie die het delen van een recept start. Zet eerst het recept om in tekst, en probeert daarna
 * de standaard deelfunctie van de browser aan te roepen.
 * 
 * @param {object} recept - Recept dat gedeeld moet worden
 */
function deel_recept(recept) {
    let gedeelde_data = {
        title: `Recept voor ${recept.naam}`,
        text: maak_deelbaar_bericht(recept)
    }

    if(navigator.canShare(gedeelde_data)) {
        navigator.share(gedeelde_data);
    } else {
        alert("Dit recept kan niet gedeeld worden.");
    }
}

/**
    * Haalt het receptenboek op van de server.
    * Opent vervolgens het recept in de url parameter "recept" in dat boek.
    */
haal_recepten_op().then(() => open_recept(url_parameters.recept));