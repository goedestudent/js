/*
    Een service worker is een bestandje dat op de achtergrond taken kan uitvoeren. Het kan ook netwerkverzoeken aanpassen.
    We gebruiken hem ook om de offline versie van de site te laten zien.
*/

var wachtwoord = "";

self.addEventListener("install", (event) => {
    console.log("Aan het installeren...");
});

// self.addEventListener('fetch', function(event) {
//     // if (event.request.url.indexOf(".jpg") > -1) {
//     //     const newRequest = new Request(event.request, {
//     //         headers: {"Authorization": `token ${wachtwoord}`},
//     //         mode: "cors"
//     //     });
//     //     return fetch(newRequest);
//     // }
//     return fetch(event.request);
// });