var menuLeft = document.getElementById("mob-menu");
var showLeft = document.getElementById("showLeft");
var findLinks = document.getElementsByClassName("findLink");
var savedLinks = document.getElementsByClassName("savedLink");
var find = document.getElementById("find");
var saved = document.getElementById("saved");


// DEFINE CLASSES

// DEFINE FUNCTIONS
// MENU FUNCTIONS
function showLeftFunction() {
    if(hasClass(menuLeft, "mob-menu-open")) {
        menuLeft.className = "mob-menu";
    } else {
        menuLeft.className += " mob-menu-open";
    }
};

function findLinksFunction() {
    showLeftFunction();
    find.style.display = "inline";
    saved.style.display = "none";
};

function savedLinksFunction() {
    showLeftFunction();
    find.style.display = "none";
    saved.style.display = "inline";
};

function hasClass(element, cls) {
    return (" " + element.className + " ").indexOf(" " + cls + " ") > -1;
}

// INITIALIZE APP PANELS

// ATTACH EVENTS
showLeft.addEventListener("click", showLeftFunction);

for(var i = 0; i < findLinks.length; i++) {
    findLinks[i].addEventListener("click", findLinksFunction);
}

for(var i = 0; i < savedLinks.length; i++) {
    savedLinks[i].addEventListener("click", savedLinksFunction);
}