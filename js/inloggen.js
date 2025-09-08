login_knop = document.getElementById("login-knop");
gebruikersnaam = document.getElementById("gebruikersnaam-invoer");
wachtwoord = document.getElementById("wachtwoord-invoer");

login_knop.addEventListener("click", probeer_in_te_loggen);

if(localStorage.getItem("gebruikersnaam") !== null && localStorage.getItem("wachtwoord") !== null)
    window.location.href = "/";

function probeer_in_te_loggen(event) {
    event.preventDefault();

    if (gebruikersnaam.value === "" || wachtwoord.value === "") {
        alert ("Vul alle gegevens in!");
        return false;
    }
    localStorage.setItem("gebruikersnaam", gebruikersnaam.value);
    localStorage.setItem("wachtwoord", wachtwoord.value);

    window.location.href = "/";
}

verander_tabblad_titel("Inloggen");