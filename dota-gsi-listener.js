function clientListener (client) {

    console.log("New client connection, IP address: " + client.ip);

    if (client.auth && client.auth.token) {
        console.log("Auth token: " + client.auth.token);
    } else {
        console.log("No Auth token");
    }

    client.on('hero', function(hero) {
        console.log(hero);
    });

    client.on('player:activity', function(activity) {
        if (activity != 'playing') return;

        console.log("Game started!");
        takeDesktopScreenshot('desktop-screenshot.png');
    });

    client.on('map:clock_time', function (clock_time) {
        console.log("Current clock time: " + clock_time);
    });

    client.on('map:game_state', function (game_state) {
        // DOTA_GAMERULES_STATE_HERO_SELECTION
        //DOTA_GAMERULES_STATE_STRATEGY_TIME
        //DOTA_GAMERULES_STATE_TEAM_SHOWCASE
        // Game state changed to: DOTA_GAMERULES_STATE_WAIT_FOR_MAP_TO_LOAD
        // Game state changed to: DOTA_GAMERULES_STATE_PRE_GAME
        // Game state changed to: DOTA_GAMERULES_STATE_GAME_IN_PROGRESS
        // Game state changed to: DOTA_GAMERULES_STATE_POST_GAME
        console.log("Game state changed to: " + game_state);
        // if (game_state == 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS') console.log("Game started!");
    });

}

export {clientListener};