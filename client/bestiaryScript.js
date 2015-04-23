//An array to keep track of all enemies
var ENEMIES = [
    'LightArtillery',
    'HeavyArtillery',
    'Railer',
    'LightGunner',
    'HeavyGunner',
    'Paladin',
    'LightMelee',
    'HeavyMelee',
    'Brute',
    'LightGrabber',
    'HeavyGrabber',
    'Snatcher',
    'LightBomber',
    'HeavyBomber',
    'Turret',
    'LightSpinner',
    'HeavySpinner',
    'Solar',
    'LightOrbiter',
    'HeavyOrbiter',
    'Hunter',
    'LightRocket',
    'HeavyRocket',
    'Harrier',
    'LightAnt',
    'HeavyAnt',
    'Goliath',
    'LightMedic',
    'HeavyMedic',
    'MegaMedic'
];

var globalData;

//on load, get some yummy data
window.addEventListener('load', function() {
    
    //get the bestiary data using the local profile
    requestData('');
});

//when the data is retrieved, place divs on the screen for them
function updateData() {
    // Add enemy boxes with data inside!
    var body = document.getElementById('bestiary');
    
    var enemy;

    for (var i = 0; i < ENEMIES.length; i++) {
        enemy = document.createElement('div');  
        enemy.className = 'enemy';
        
        var enemyName = ENEMIES[i];
        var deaths = 0;
        var kills = 0;
        //console.log(globalData);
        
        //searches for the value, if found in the object, add the value
        if(globalData.deathTypes[enemyName])
        {
            deaths = globalData.deathTypes[enemyName];
        }
        if(globalData.killTypes[enemyName])
        {
            kills = globalData.killTypes[enemyName];
        }
        
        //print data to the divs
        enemy.innerHTML = (ENEMIES[i] + "<br />" + "Kills: " + kills + "<br />" + "  Deaths: " + deaths);
        
        enemy.style.backgroundImage = "url('assets/FullEnemies/enemy" + ENEMIES[i] + "Full.png')";
        body.appendChild(enemy);
    }
}

//requests data from the server
function requestData(account) {
    $.ajax({
        cache: false,
        type: "POST",
        url: "/account",
        data: {
            account: account.toUpperCase()
        },
        dataType: "json",
        success: function(result, status, xhr) {
            globalData = result.profile;
            updateData();
        },
        error: function(xhr, status, error) {
            ;
        }
    });
}