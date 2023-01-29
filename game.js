// Set the tint of the screen for hot/cold
document.getElementById("tint").width = window.innerWidth;
document.getElementById("tint").height = window.innerHeight;
document.getElementById("tint").style.position = "absolute";


window.onload = () => {
    // When the A-Frame loads add the given entities specified in the URL
    // Retrieve list of pairs of latitude and longitude
    var entities = parseURL(window.location.search);
    var destCount = 0;              // number of destinations successfully visited
    let coordinateList = [];        // 
    var firstDistance = 0;
    var targetLat = 0;
    var targetLong = 0;
    var cnt = false;
    const colorArray = ['#FF0000', '#FF0000', '#990066', '#660099', '#3300CC', '#0000FF'];

    main(0);
}



function main() {

    while(destCount < numPoints) {
        getLocation();
        targetLat = entities[destCount].lat;
        targetLong = entities[destCount].lon;
    }
    alert("GAME OVER");
}


function reachedDest() {
    var count = 0;
    document.getElementById("tint").setAttribute("visible", false);

    function minigame() {
        document.getElementById("count").innerText = (
          parseInt(document.getElementById("count").innerText) + 1
         ).toString();
        const marker = document.getElementById(`marker`);
        const parent = marker.parentNode;
        marker.parentNode.removeChild(marker);
        const newc = document.createElement("a-sphere");
        newc.setAttribute("color", "#EF2D5E");
        randomX = Math.random() * 20 - 10;
        randomY = Math.random() * 20 - 10;
        newc.setAttribute("position", `${randomX} 4 ${randomY}`);
        newc.setAttribute("radius", "2.0");
        newc.id = `marker`;
        parent.appendChild(newc);
        newc.addEventListener("click", minigame);
        count++;
    };

    if(timer === 0) {
        destCount++;
    }
    const marker = document.getElementById(`marker`);
        marker.addEventListener("click", minigame);
}

function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = deg2rad(lat2 - lat1);
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c * 1000;
    return d;
}

function round(num, places) {
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

function getAvg(nums) {
    const total = nums.reduce((acc, c) => acc + c, 0);
    return total / nums.length;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

function getLocation() {
    if (!navigator.geolocation) {
        console.log('Geolocation API not supported by this browser.');
    } else {
    console.log('Checking location...');
    navigator.geolocation.getCurrentPosition(success(), error);
    }
    setTimeout(getLocation, 1000);
}

function success(position) {
        let lat = round(position.coords.latitude, 4);
        let long = round(position.coords.longitude, 4);
        let distance = round(getDistanceFromLatLonInM(lat, long, targetLat, targetLong), 2);

        if (!cnt) {
            firstDistance = distance;
            cnt = true;
        }

        if (coordinateList.length < 3) {
            coordinateList.push(distance);
        }
        else {
            coordinateList.shift();
            coordinateList.push(distance);
        }

        let averageDistance = getAvg(coordinateList);

        i = Math.floor(averageDistance / (firstDistance) * 4);
        if (i >= 6) {
            i = 5;
        }
        console.log(i);
        if (i == 0 || i == 1) {
            document.getElementById("tint").setAttribute("visible", false);
            document.getElementById("marker").setAttribute("visible", true);
        reachedDest();
        }
        document.getElementById("tint").style.backgroundColor = colorArray[i];
}

function error() {
    console.log('Geolocation error!');
}


/**
 * Parses the given URL into latitude and longitude pairs 
 * @param {String} url the url formatted as .../?entities=lat_lon,lat_lon,...,lat_lon 
 * @return {List[Dictionary]} a list of {'lat': lat, 'lon', lon} pairs 
 * 
 * For example:
 *  http://.../?entities=41.826835_-71.399710,41.827835_-71.399710
 *  becomes [{'lat': 41.826835, 'lon': -71.399710}, {'lat': 41.827835, 'lon': -71.399710}]
 */
function parseURL(url){
    let entities = [];
    var entities_url = url.split("=")[1];
    var lat_lon_list = entities_url.split(",");
    for (const lat_lon_str of lat_lon_list){
        lat_lon = lat_lon_str.split('_');
        lat = parseFloat(lat_lon[0]);
        lon = parseFloat(lat_lon[1]);
        console.log(`(${lat}, ${lon})`);
        entities.push({'lat': lat, 'lon': lon});
    }
    return entities;
}

/**
 * Creates and adds the given AR entity of color at the latitude and longitude 
 * @param {String} color 
 * @param {Float} latitude 
 * @param {Float} longitude 
 */
function createEntity(color, latitude, longitude){

    let testEntityAdded = false;
    if(!testEntityAdded) {
        // Add a box to the north of the initial GPS position
        const entity = document.createElement("a-box");
        entity.setAttribute("scale", {
            x: 20, 
            y: 20,
            z: 20
        });
        entity.setAttribute('material', { color: color } );
        entity.setAttribute('gps-new-entity-place', {
            latitude: latitude,
            longitude: longitude
        });
        document.querySelector("a-scene").appendChild(entity);
    }
    testEntityAdded = true;
}