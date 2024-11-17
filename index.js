import d2gsi from 'dota2-gsi';
import RoshApi from './rosh-api.js';
import DotaHeroDetector from './hero-pick-detector.js';
import {clientListener} from './dota-gsi-listener.js';
import {takeDesktopScreenshot} from './utils.js';

(async () => {
    const heroDetector = new DotaHeroDetector();
    const roshApi = new RoshApi();
    const server = new d2gsi();

    try {
        await heroDetector.initialize();
        // await roshApi.initBrowser();
        // server.events.on('newclient', clientListener);
        
        const screenshot = await takeDesktopScreenshot(2)
        const status = await heroDetector.getDraft(screenshot);
        console.log(status);
        // await roshApi.banHero('Invoker');
        // await roshApi.banHero('Medusa');

        // await roshApi.pickHero('Luna', 'Radiant', 1);

        // await delay(5000);

        // await roshApi.pickHero('Windranger', 'Radiant', 1);

        // await roshApi.reset();
    } catch (e) {
        console.log(e);
    }

})();

