import d2gsi from 'dota2-gsi';
import RoshApi from './rosh-api.js';
import DotaHeroDetector from './hero-pick-detector.js';
import screenshot from 'screenshot-desktop';

const server = new d2gsi();

async function takeDesktopScreenshot(outputPath) {
    try {
        await screenshot({ filename: outputPath });
        console.log(`Desktop screenshot saved to ${outputPath}`);
    } catch (error) {
        console.error('Error taking desktop screenshot:', error);
    }
}

server.events.on('newclient', function (client) {

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

});



(async () => {
    const heroDetector = new DotaHeroDetector();
    const roshApi = new RoshApi();

    try {
        await heroDetector.initialize('./hero_pick_images');
        // await roshApi.initBrowser();

        // const status = await detector.getDraft('./draft-screen-ban.png');

        // await roshApi.banHero('Invoker');
        // await roshApi.banHero('Medusa');

        // await roshApi.pickHero('Luna', 'Radiant', 1);

        // await delay(5000);

        // await roshApi.pickHero('Windranger', 'Radiant', 1);


        // await roshApi.reset();
    } catch (e) {
        console.log(e);
    }


    // await roshApi.pickHero('Windranger', 'Radiant', 1);


    // await roshApi.pickHero('Lina', 'Radiant', 2);
    // await roshApi.pickHero('Windranger', 'Radiant', 3);
    // await roshApi.pickHero('Silencer', 'Radiant', 4);
    // await roshApi.pickHero('Lich', 'Radiant', 5);

    // await roshApi.pickHero('Phantom Lancer', 'Dire', 1);
    // await roshApi.pickHero('Pudge', 'Dire', 2);
    // await roshApi.pickHero('Lion', 'Dire', 3);
    // await roshApi.pickHero('Sven', 'Dire', 4);
    // await roshApi.pickHero('Dazzle', 'Dire', 5);

})();

const delay = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}