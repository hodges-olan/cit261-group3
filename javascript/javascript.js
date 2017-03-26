var apiKey = "AIzaSyCE8w375SPipwe0YHEaes5sfcwju_gH5GE";
var googlePlacesNearbySearch = "/maps/api/place/nearbysearch/json?";
var googlePlacesDetailSearch = "/maps/api/place/details/json?";
var menuLeft = document.getElementById("mob-menu");
var showLeft = document.getElementById("showLeft");
var findLinks = document.getElementsByClassName("findLink");
var savedLinks = document.getElementsByClassName("savedLink");
var findPanel = document.getElementById("find");
var savedPanel = document.getElementById("saved");
var searchRestaurantFormBtn = document.getElementById("searchRestaurantFormBtn");
var savedLocation = "myFavoriteRestaurants";


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
    savedPanel.style.display = "none";
    findPanel.style.display = "inline";
};

function savedLinksFunction() {
    showLeftFunction();
    savedRestaurants();
    findPanel.style.display = "none";
    savedPanel.style.display = "inline";
};

// CUSTOM FUNCTIONS
function hasClass(element, cls) {
    return (" " + element.className + " ").indexOf(" " + cls + " ") > -1;
}

function getLocation(e) {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(searchRestaurants);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function displayRestaurants(restaurants, list, div) {
    var restaurantsUL = document.getElementById(list);
    while (restaurantsUL.hasChildNodes()) {
        restaurantsUL.removeChild(restaurantsUL.lastChild);
    }
    restaurants.results.forEach(function (restaurant) {
        var liElement = document.createElement("li");
        liElement.id = restaurant.place_id;
        var text = document.createTextNode(restaurant.name + " - " + restaurant.rating);
        liElement.appendChild(text);
        restaurantsUL.appendChild(liElement);
    });
}

function showRestaurantModal(response) {
    var showRestaurantModal = document.getElementById("showRestaurantModal");
    document.getElementById("showRestaurantModalTitle").textContent = response.result.name;
    document.getElementById("showRestaurantModalAddress").textContent = response.result.formatted_address;
    document.getElementById("showRestaurantModalPhone").textContent = response.result.formatted_phone_number;
    document.getElementById("showRestaurantModalRating").textContent = response.result.rating;
    var oldShowRestaurantModalSchedule = document.getElementById("showRestaurantModalSchedule");
    var newShowRestaurantModalSchedule = document.createElement("ul");
    newShowRestaurantModalSchedule.id = "showRestaurantModalSchedule";
    response.result.opening_hours.weekday_text.forEach(function (entry) {
        var liElement = document.createElement("li");
        liElement.textContent = entry;
        newShowRestaurantModalSchedule.appendChild(liElement);
    });
    document.getElementById("modalContentBody").replaceChild(newShowRestaurantModalSchedule, oldShowRestaurantModalSchedule);
    document.getElementById("showRestaurantModalWebsite").href = response.result.website;
    document.getElementById("showRestaurantModalPlaceId").value = response.result.place_id;
    //add check here for saved or not.
    var savedRestaurants = loadSavedRestaurants();
    var found = false;
    savedRestaurants.forEach(function (restaurant) {
        if(restaurant === response.result.place_id) {
            document.getElementById("showRestaurantModalSaveBtnImg").src = "/images/placeholder-red.png";
            document.getElementById("showRestaurantModalSaveBtn").addEventListener("click", deleteRestaurant);
            found = true;
        }
    });
    if(!found) {
        document.getElementById("showRestaurantModalSaveBtnImg").src = "/images/placeholder-black.png";
        document.getElementById("showRestaurantModalSaveBtn").addEventListener("click", saveRestaurant);
    }
    showRestaurantModal.style.display = "inline";
}

function showRestaurantModalCloseFunction() {
    document.getElementById("showRestaurantModalSaveBtn").removeEventListener("click", saveRestaurant);
    document.getElementById("showRestaurantModal").style.display = "none";
}

// LOCAL STORAGE FUNCTIONS
function loadSavedRestaurants() {
    var savedRestaurants = JSON.parse(localStorage.getItem(savedLocation));
    if(savedRestaurants === null) {
        savedRestaurants = Array();
    }
    return savedRestaurants;
}

function saveRestaurant(e) {
    var newSavedRestaurant = document.getElementById("showRestaurantModalPlaceId").value;
    var lsSavedRestaurants = loadSavedRestaurants();
    lsSavedRestaurants.forEach(function (restaurant) {
        if(restaurant === newSavedRestaurant) {
            return false;
        }
    });
    lsSavedRestaurants.push(newSavedRestaurant);
    localStorage.setItem(savedLocation, JSON.stringify(lsSavedRestaurants));
    document.getElementById("showRestaurantModalSaveBtnImg").src = "/images/placeholder-red.png";
    document.getElementById("showRestaurantModalSaveBtn").removeEventListener("click", saveRestaurant);
    document.getElementById("showRestaurantModalSaveBtn").addEventListener("click", deleteRestaurant);
    if(savedPanel.style.display === "inline") {
        savedRestaurants();
    }
    return false;
}

function deleteRestaurant(e) {
    var newDeleteRestaurant = document.getElementById("showRestaurantModalPlaceId").value;
    var lsSavedRestaurants = loadSavedRestaurants();
    var counter = 0;
    lsSavedRestaurants.forEach(function (restaurant) {
        if(restaurant === newDeleteRestaurant) {
            lsSavedRestaurants.splice(counter, 1);
            localStorage.setItem(savedLocation, JSON.stringify(lsSavedRestaurants));
            document.getElementById("showRestaurantModalSaveBtnImg").src = "/images/placeholder-black.png";
            document.getElementById("showRestaurantModalSaveBtn").removeEventListener("click", deleteRestaurant);
            document.getElementById("showRestaurantModalSaveBtn").addEventListener("click", saveRestaurant);
            if(savedPanel.style.display === "inline") {
                savedRestaurants();
            }
            return false;
        } else {
            counter++;
        }
    });
    return false;
}

// GOOGLE PLACES API
function searchRestaurants(location) {
    var cuisine = document.getElementById("cuisine").value;
    var miles = document.getElementById("miles").value;
    var cost = document.getElementById("cost").value;
    if (radius === null || miles === "" || miles <= 0) {
        document.getElementById("miles").value = "";
        document.getElementById("miles").placeholder = "Whole number here";
        document.getElementById("miles").className = "error";
        return false;
    } else {
        document.getElementById("miles").className = "";
        var radius = Math.floor(parseInt(miles)) * 1609.34;
        document.getElementById("miles").value = Math.floor(parseInt(miles));
    }
    var searchRestaurantsUrl = googlePlacesNearbySearch + "key=" + apiKey + "&location=" + location.coords.latitude + "," + location.coords.longitude + "&radius=" + radius + "&type=restaurant&maxprice=" + cost + "&opennow=true";
    if(cuisine !== "All") {
        searchRestaurantsUrl += "&keyword=" + cuisine;
    }
    var searchRestaurantsXhttp = new XMLHttpRequest();
    searchRestaurantsXhttp.onload = function() {
        var response = JSON.parse(searchRestaurantsXhttp.responseText);
        if(response.status === "OK") {
            displayRestaurants(response, "searchRestaurantsListUL", "searchRestaurantsList");
        } else if(response.status === "ZERO_RESULTS") {
            alert("No restaurants found!");
        } else {
            alert(response.status);
        }
    };
    searchRestaurantsXhttp.open("GET", searchRestaurantsUrl);
    searchRestaurantsXhttp.send();
}

function showRestaurant(e) {
    var placeId = e.target.id;
    var searchDetailsUrl = googlePlacesDetailSearch + "key=" +apiKey + "&placeid=" + placeId;
    var searchDetailsXhttp = new XMLHttpRequest();
    searchDetailsXhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var response = JSON.parse(searchDetailsXhttp.responseText);
            if(response.status === "OK") {
                showRestaurantModal(response);
            } else if(response.status === "ZERO_RESULTS") {
                alert("Restaurant not found!");
            } else {
                alert(response.status);
            }
        }
    };
    searchDetailsXhttp.open("GET", searchDetailsUrl);
    searchDetailsXhttp.send();
}

function savedRestaurants() {
    document.getElementById("loadWindow").style.display = "inline";
    var savedRestaurants = loadSavedRestaurants();
    var savedRestaurantsResponses = {results:[]};
    savedRestaurants.forEach(function (placeId) {
        var searchDetailsUrl = googlePlacesDetailSearch + "key=" + apiKey + "&placeid=" + placeId;
        var searchDetailsXhttp = new XMLHttpRequest();
        searchDetailsXhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                var response = JSON.parse(searchDetailsXhttp.responseText);
                if(response.status === "OK") {
                    savedRestaurantsResponses.results.push(response.result);
                }
            }
        };
        searchDetailsXhttp.open("GET", searchDetailsUrl, false);
        searchDetailsXhttp.send();
    });
    displayRestaurants(savedRestaurantsResponses, "savedRestaurantsListUL", "savedRestaurantsList");
    document.getElementById("loadWindow").style.display = "none";
}

// ATTACH EVENTS
showLeft.addEventListener("click", showLeftFunction);
searchRestaurantFormBtn.addEventListener("click", getLocation);
document.getElementById("searchRestaurantsListUL").addEventListener("click", showRestaurant);
document.getElementById("savedRestaurantsListUL").addEventListener("click", showRestaurant);
document.getElementById("showRestaurantModalClose").addEventListener("click", showRestaurantModalCloseFunction);

for(var i = 0; i < findLinks.length; i++) {
    findLinks[i].addEventListener("click", findLinksFunction);
}

for(var i = 0; i < savedLinks.length; i++) {
    savedLinks[i].addEventListener("click", savedLinksFunction);
}