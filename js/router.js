/*
    In dit JavaScript bestand komen alle functies t.b.v. het navigeren op de website. Dat wil zeggen, alle functies die er voor zorgen dat het openen
    van paginas mogelijk is.
    Normaal gebeurt deze navigatie automatisch, maar we willen onze eigen navigatie om speciale dingen te kunnen doen.
*/

// Eerst maken we globale variabelen voor parameters
let query_parameters = {}; // Query parameters zijn de dingen die na het ? in de link staan
let url_parameters = {};   // Sommige paginas hebben url parameters. Bij /recept/plaattaart is de parameter bijvoorbeeld plaattaart

// Eerst worden nu alle beschikbare paginas gedefinieerd.
// -----------

// Hier komt een lijst van alle pagina's. Normaal is dit niet nodig, en kan je gewoon direct naar de html bestanden en deze openen (http://.../pagina.html).
// Omdat we echter speciale links willen (bijvoorbeeld http://.../recept/vissticks), dus zonder die html, moeten we dit formaat gebruiken om zelf het goede bestand te vinden.
const routes = [
    { link: "/", pagina: "home" },
    { link: "/inloggen", pagina: "inloggen" },
    { link: "/recept/:recept", pagina: "recept" },
    { link: "/recept_maken/:recept", pagina: "recept-maken" },
    { link: "/recept_maken", pagina: "recept-maken" },
    { link: "/account", pagina: "account" },
    { link: "/feedback", pagina: "feedback" }
];

// Voor al deze paginas de regular expression berekenen
for (let index = 0; index < routes.length; index++) {
    const route = routes[index];
    route.parameters = parameter_namen(route.link);
    route.link = pad_als_regular_expression(route.link);
}

// Een regular expression is een soort manier om bepaalde stukken binnen een string te kunnen vinden. Je kan dan bijvoorbeeld kijken 
// hoe vaak "o" voorkomt in "De poes loopt van noord naar oost." Ook kan je een bepaald stuk tekst ophalen. Stel een string heeft altijd 
// de vorm "Mijn kat heet ... en is lief", dan kan je een regex opstellen om de tekst tussen "Mijn kat heet " en " en is lief" te geven.
// Op die manier kan je de naam van de kat dan vinden.

/**
 * Gegeven een pad, maakt een regular expression van dat pad.
 * @param {string} pad - Link naar een bepaalde pagina op onze website
 * @returns {RegExp} - Regular expression object dat kan worden gebruikt om te kijken of een bepaalde string de link naar de pagina bevat.
 */
function pad_als_regular_expression(pad) {
    // Zie ook https://dev.to/dcodeyt/building-a-single-page-app-without-frameworks-hl9

    let expressie_pad = pad
        .replaceAll("/", "\\/")    // Maak van alle '/' een '\/', dat is nodig voor de regex
        .replace(/:\w+/g, "(.+)"); // Maak van alle ':' met 1 of meer letters erachter (bv :ab, :12 :a3c, maar niet : of :/) een (.+). 
                                   //Dat is een 'capture group' die kan gebruikt worden om de tekst die op die plek staat op te halen.
                                   // Denk in bovenstaand voorbeeld aan "Mijn kat heet (.+) en is lief"
    let expressie = `^${expressie_pad}$`;
    return new RegExp(expressie);
}

/**
 * Geeft een lijst van alle stukken in een pad, waar ':' voor staat.
 * Bijvoorbeeld in "/pagina/:id1/:id2" is het resultaat ["id1", "id2"]
 * @param {string} pad - Link naar een bepaalde pagina op onze website
 * @returns {string[]} - Lijst van stukken van een link met een ':' ervoor (zie voorbeeld)
 */
function parameter_namen(pad) {
    // Vind alle stukken tekst die beginnen met een ':'.
    // We gebruiken dit om de namen van de parameters te vinden in de link, zo kunnen we bijvoorbeeld :recept in de link van de routes verbinden met 
    // 3 in het pad dat de gebruiker wil zien.
    let expressie = /:(\w+)/g;
    return Array.from(pad.matchAll(expressie)).map(match => match[1]); // Match 1 bevat wat er daadwerkelijk in de groep (\w+) zit, dus zonder de :.
}

/**
 * Geeft een object, dat een parameter heeft voor elke naam in 'route_parameters'. De waarde van die parameter is de waarde van
 * parameter_waardes op dezelfde index.
 * Bijvoorbeeld als er een route "/pagina/:id1/:id2" is, en de gebruiker navigeert naar /pagina/a/2 is het resultaat { id1: a, id2: 2 }.
 * @param {string[]} route_parameters  - Namen van parameters in het pad zoals gedefinieerd in de routes
 * @param {string[]} parameter_waardes - Waardes van parameters in het pad dat de gebruiker wil bezoeken
 * @returns {object} - Mapping tussen route parameter naam, en waarde in de link die de gebruiker probeert te bezoeken
 */
function verbind_parameters(route_parameters, parameter_waardes) {
    let resultaat = {};

    for (let index = 0; index < route_parameters.length; index++) {
        const parameter = route_parameters[index];
        // Index + 1, want bij een regex is de waarde op plek 0 altijd die met de gehele string. Vanaf 1 beginnen dan de gevonden groepen.
        const waarde = decodeURIComponent(parameter_waardes[index + 1]);

        resultaat[parameter] = waarde;
    }

    return resultaat;
}


// Hier gebeurd het daadwerkelijk zoeken en openen van de goede pagina
// ---------

// Deze variabele houdt vast welke <script> geplaatst is door de code, om deze weg te kunnen halen.
let vorige_js;

function open_link() {

    query_parameters = {};
    url_parameters = {};

    if (vorige_js) {
        document.body.removeChild(vorige_js);
        vorige_js = undefined;
    }

    // Sla alle waardes in de query parameter (de dingen na het ? in de URL) op in een handig object, om er later makkelijker bij te kunnen.
    window.location.search.substring(1).split("&").forEach(element => {
        let naam = element.split("=")[0];
        let waarde = element.split("=")[1];
        query_parameters[naam] = decodeURIComponent(waarde);
    });

    // Lijst, waarbij op alle routes de regular expressie is uitgevoerd op de link bovenin.
    // Op die manier, kunnen we kijken welke route een match heeft met de link die de gebruiker wil openen.
    let mogelijke_routes = routes.map(
        (route) => {
            return {
                route, 
                match: location.pathname.match(route.link)
            }
        }
    );

    // Kijken of één van onze routes matcht met het pad dat de gebruiker wil openen
    let kandidaat = mogelijke_routes.find(route => route.match !== null);

    // Naam van het tabblad resetten
    verander_tabblad_titel("J & J's receptenboek");

    if(kandidaat !== undefined) {
        // Jaa! Er is een match!
        url_parameters = verbind_parameters(kandidaat.route.parameters, kandidaat.match)
        document.getElementById("dynamische-stijl").href = `/css/${kandidaat.route.pagina}.css`;

        let js = document.createElement("script");
        js.src = `/js/${kandidaat.route.pagina}.js`;
        vorige_js = js;

        let verzoek = new XMLHttpRequest();
        verzoek.onloadend = () => {
            if (verzoek.status === 200) {
                document.getElementById("pagina").innerHTML = verzoek.responseText;
                document.body.appendChild(js);
            }
        }
        
        verzoek.open("GET", `/paginas/${kandidaat.route.pagina}.html`);
        verzoek.send();

    } else {
        // We hebben geen pagina die hier op lijkt :(
        console.log("Geen kandidaat");
        ga_naar_pagina("/");
    }
}

open_link();

/**
 * Kijkt of het gegeven element of een omvattend element daarvan een link (<a>) is met een ingevulde href.
 * Geeft daarna die link terug, of null als er geen link is.
 * 
 * @param {HTMLElement} element - Element waarvan gekeken wordt of het een link is
 * @returns {string?} - De link als deze er is, null als deze er niet is
 */
function heeft_ergens_link(element) {
    // Als het element niet bestaat heeft het zeker geen lnk
    if (element == undefined)
        return null;

    // Dit is een link met ingevulde href, geef die href als resultaat
    if (element.matches("a[href]"))
        return element.href;

    // Kijk of het omvattend element een link is
    return heeft_ergens_link(element.parentElement);
}

/**
 * Event handler voor een klik op een element. Kijkt vervolgens of dit element een link is en zorgt dan
 * dat de standaard navigatie niet wordt uitgevoerd. In plaats daarvan zal onze eigen navigatie worden aangeroepen.
 * @param {Event} event - OnClick event
 */
function herschrijf_links(event) {
    // Doe dit alleen als het geklikte object een link is met een href
    // D.w.z. dat of het element waarop geklikt is (event.target) of een element daar omheen (target.parentElement)
    // een a tag met een href moet zijn.
    let href = heeft_ergens_link(event.target)
    if (href) {
        // Zorg ervoor dat de pagina niet wordt geopend
        event.preventDefault();
        ga_naar_pagina(href);
    }
}

/**
 * Laat de navigatie naar de pagina gaan met de gegeven link
 * @param {string} link - link naar pagina om te openen
 */
function ga_naar_pagina(link) {
    history.pushState(null, "", link);
    open_link();
}

document.body.addEventListener("click", herschrijf_links, true);

// Deze zorgt ervoor dat als de gebruiker naar de vorige of volgende pagina gaat,
// dat onze navigatie die pagina ook echt opent.
window.addEventListener("popstate", open_link);