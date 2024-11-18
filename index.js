import d2gsi from "dota2-gsi";
import DotaHeroDetector from "./hero-pick-detector.js";
import RoshApi from "./rosh-api.js";
import { heroDetails, initialDraft, takeDesktopScreenshot } from "./utils.js";

(async () => {
  const heroDetector = new DotaHeroDetector();
  const roshApi = new RoshApi();
  const server = new d2gsi();
  const screenshotInterval = 10; // seconds
  let gameState = null;
  let lastScreenshotTime = 0;
  let lastDraft = initialDraft;

  async function updateDraft() {
    const screenshot = await takeDesktopScreenshot(0); // 0 is the main display
    const draft = await heroDetector.getDraft(screenshot);

    console.log(draft);

    //check if the draft has changed
    if (JSON.stringify(draft) === JSON.stringify(lastDraft)) {
      console.log("Draft has not changed");
      return;
    }

    //check if banned array has changed and ban the heroes
    const bannedHeroes = draft.banned.filter(
      (hero) => !lastDraft.banned.includes(hero)
    );

    if (draft.banned.length < 10) {
      for (const hero of bannedHeroes) {
        await roshApi.banHero(hero);
        lastDraft.banned.push(hero);
      }
    }

    //check if picked array has changed and pick the heroes
    const radiantPickedHeroes = draft.picked.radiant.filter(
      (hero) => !lastDraft.picked.radiant.includes(hero)
    );
    const direPickedHeroes = draft.picked.dire.filter(
      (hero) => !lastDraft.picked.dire.includes(hero)
    );

    for (const hero of radiantPickedHeroes) {
      const { heroName, position } = getHeroDetails(hero, "Radiant");
      await roshApi.pickHero(heroName, "Radiant", position);

      lastDraft.picked.radiant.push(hero);
      lastDraft.picked.radiant_positions.push(position);
    }

    for (const hero of direPickedHeroes) {
      const { heroName, position } = getHeroDetails(hero, "Dire");

      await roshApi.pickHero(heroName, "Dire", position);

      lastDraft.picked.dire.push(hero);
      lastDraft.picked.dire_positions.push(position);
    }

    console.log("Draft updated");
  }

  function getHeroDetails(hero, side = "Radiant") {
    const heroName = heroDetails[hero] ? heroDetails[hero].heroName : hero;
    const heroPositions = heroDetails[hero]
      ? heroDetails[hero].positions
      : [1, 2, 3, 4, 5];
    const draftPositions =
      side == "Radiant"
        ? lastDraft.picked.radiant_positions
        : lastDraft.picked.dire_positions;
    const possiblePositions = [1, 2, 3, 4, 5];
    let position = 5;

    for (const heroPosition of heroPositions) {
      if (!draftPositions.includes(heroPosition)) {
        position = heroPosition;
        break;
      }
    }

    // get the first available position
    for (const possiblePosition of possiblePositions) {
      if (!draftPositions.includes(possiblePosition)) {
        position = possiblePosition;
        break;
      }
    }

    return { heroName, position };
  }

  function clientListener(client) {
    console.log("New client connection, IP address: " + client.ip);

    if (client.auth && client.auth.token) {
      console.log("Auth token: " + client.auth.token);
    } else {
      console.log("No Auth token");
    }

    client.on("player:activity", function (activity) {
      if (activity != "playing") return;

      console.log("Game started!");

      roshApi.reset();
      lastDraft = initialDraft;
    });

    client.on("map:clock_time", function (clock_time) {
      const currentTime = Date.now();
      //   console.log("Current clock time: " + clock_time);
      if (
        gameState === "DOTA_GAMERULES_STATE_HERO_SELECTION" &&
        currentTime >= lastScreenshotTime + screenshotInterval
      ) {
        lastScreenshotTime = currentTime;
        updateDraft();
      }
    });

    client.on("map:game_state", function (game_state) {
      // DOTA_GAMERULES_STATE_HERO_SELECTION
      // DOTA_GAMERULES_STATE_STRATEGY_TIME
      // DOTA_GAMERULES_STATE_TEAM_SHOWCASE
      // DOTA_GAMERULES_STATE_WAIT_FOR_MAP_TO_LOAD
      // DOTA_GAMERULES_STATE_PRE_GAME
      // DOTA_GAMERULES_STATE_GAME_IN_PROGRESS
      // DOTA_GAMERULES_STATE_POST_GAME
      gameState = game_state;
      console.log("Game state changed to: " + game_state);
      // if (game_state == 'DOTA_GAMERULES_STATE_GAME_IN_PROGRESS') console.log("Game started!");
    });
  }

  try {
    server.events.on("newclient", clientListener);
    await heroDetector.initialize();
    await roshApi.initBrowser();
    // setInterval(async () => {
    //     updateDraft();
    // }, 15000);
  } catch (e) {
    console.log(e);
  }
})();
