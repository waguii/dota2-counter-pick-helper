import screenshot from "screenshot-desktop";
import sharp from "sharp";

async function takeDesktopScreenshot(display = 0) {
  try {
    const displays = await screenshot.listDisplays();

    if (display === 0 || display >= displays.length) {
      display = displays[0].id;
    } else {
      display = displays[display].id;
    }

    const result = await screenshot({ format: "png", screen: display });

    // await sharp(result).removeAlpha().toFile(`screenshot.png`);

    return await sharp(result).removeAlpha().toBuffer();
  } catch (error) {
    console.error("Error taking desktop screenshot:", error);
  }
}

const delay = (time) => {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
};

const initialDraft = {
  banned: [],
  picked: {
    radiant: [],
    dire: [],
    radiant_positions: [],
    dire_positions: [],
  },
};

const heroDetails = {
  abaddon: { heroName: "Abaddon", positions: [1, 3, 5, 4, 2] },
  abyssal_underlord: { heroName: "Abyssal Underlord", positions: [3] },
  alchemist: { heroName: "Alchemist", positions: [1, 2, 3] },
  ancient_apparition: { heroName: "Ancient Apparition", positions: [5] },
  antimage: { heroName: "Anti-Mage", positions: [1] },
  arc_warden: { heroName: "Arc Warden", positions: [1, 2] },
  axe: { heroName: "Axe", positions: [3] },
  bane: { heroName: "Bane", positions: [5] },
  batrider: { heroName: "Batrider", positions: [3] },
  beastmaster: { heroName: "Beastmaster", positions: [3] },
  bloodseeker: { heroName: "Bloodseeker", positions: [1, 2] },
  bounty_hunter: { heroName: "Bounty Hunter", positions: [4] },
  brewmaster: { heroName: "Brewmaster", positions: [3] },
  bristleback: { heroName: "Bristleback", positions: [3] },
  broodmother: { heroName: "Broodmother", positions: [1] },
  centaur_warrunner: { heroName: "Centaur Warrunner", positions: [3] },
  chaos_knight: { heroName: "Chaos Knight", positions: [1] },
  chen: { heroName: "Chen", positions: [4] },
  clinkz: { heroName: "Clinkz", positions: [1] },
  clockwerk: { heroName: "Clockwerk", positions: [3] },
  crystal_maiden: { heroName: "Crystal Maiden", positions: [5] },
  dark_seer: { heroName: "Dark Seer", positions: [3] },
  dark_willow: { heroName: "Dark Willow", positions: [4] },
  dazzle: { heroName: "Dazzle", positions: [5] },
  death_prophet: { heroName: "Death Prophet", positions: [2, 3] },
  disruptor: { heroName: "Disruptor", positions: [5] },
  doom_bringer: { heroName: "Doom", positions: [3] },
  dragon_knight: { heroName: "Dragon Knight", positions: [2, 3] },
  drow_ranger: { heroName: "Drow Ranger", positions: [1] },
  earth_spirit: { heroName: "Earth Spirit", positions: [4] },
  earthshaker: { heroName: "Earthshaker", positions: [4] },
  elder_titan: { heroName: "Elder Titan", positions: [4] },
  ember_spirit: { heroName: "Ember Spirit", positions: [1, 2] },
  enchantress: { heroName: "Enchantress", positions: [4] },
  enigma: { heroName: "Enigma", positions: [4] },
  faceless_void: { heroName: "Faceless Void", positions: [1, 3] },
  grimstroke: { heroName: "Grimstroke", positions: [5] },
  gyrocopter: { heroName: "Gyrocopter", positions: [1, 2] },
  huskar: { heroName: "Huskar", positions: [1, 2] },
  invoker: { heroName: "Invoker", positions: [2, 3] },
  jakiro: { heroName: "Jakiro", positions: [5] },
  juggernaut: { heroName: "Juggernaut", positions: [1, 2] },
  keeper_of_the_light: { heroName: "Keeper of the Light", positions: [4] },
  kunkka: { heroName: "Kunkka", positions: [2, 3] },
  legion_commander: { heroName: "Legion Commander", positions: [1, 3] },
  leshrac: { heroName: "Leshrac", positions: [2, 3] },
  lich: { heroName: "Lich", positions: [5] },
  lifestealer: { heroName: "Lifestealer", positions: [1, 3] },
  lina: { heroName: "Lina", positions: [2, 4] },
  lion: { heroName: "Lion", positions: [4] },
  lone_druid: { heroName: "Lone Druid", positions: [1, 3] },
  luna: { heroName: "Luna", positions: [1] },
  lycan: { heroName: "Lycan", positions: [1, 3] },
  magnus: { heroName: "Magnus", positions: [3] },
  mars: { heroName: "Mars", positions: [3] },
  medusa: { heroName: "Medusa", positions: [1, 2] },
  meepo: { heroName: "Meepo", positions: [1] },
  mirana: { heroName: "Mirana", positions: [2, 4] },
  monkey_king: { heroName: "Monkey King", positions: [1, 2] },
  morphling: { heroName: "Morphling", positions: [1, 2] },
  naga_siren: { heroName: "Naga Siren", positions: [1, 4] },
  furion: { heroName: "Nature's Prophet", positions: [1, 3] },
  necrolyte: { heroName: "Necrophos", positions: [2, 3] },
  night_stalker: { heroName: "Night Stalker", positions : [3, 4] },
  nyx_assassin: { heroName: "Nyx Assassin", positions: [4] },
  ogre_magi: { heroName: "Ogre Magi", positions: [5] },
  omniknight: { heroName: "Omniknight", positions: [3, 5] },
  oracle: { heroName: "Oracle", positions: [5] },
  outworld_devourer: { heroName: "Outworld Devourer", positions: [2, 3] },
  pangolier: { heroName: "Pangolier", positions: [1, 3] },
  phantom_assassin: { heroName: "Phantom Assassin", positions: [1] },
  phantom_lancer: { heroName: "Phantom Lancer", positions: [1] },
  phoenix: { heroName: "Phoenix", positions: [5] },
  primal_beast: { heroName: "Primal Beast", positions: [3] },
  puck: { heroName: "Puck", positions: [2, 3] },
  pudge: { heroName: "Pudge", positions: [4] },
  pugna: { heroName: "Pugna", positions: [2, 4] },
  queenofpain: { heroName: "Queen of Pain", positions: [2, 3] },
  razor: { heroName: "Razor", positions: [1, 2] },
  riki: { heroName: "Riki", positions: [4] },
  rubick: { heroName: "Rubick", positions: [4] },
  sand_king: { heroName: "Sand King", positions: [3] },
  shadow_demon: { heroName: "Shadow Demon", positions: [4] },
  shadow_shaman: { heroName: "Shadow Shaman", positions: [4] },
  slardar: { heroName: "Slardar", positions: [3] },
  slark: { heroName: "Slark", positions: [1, 2] },
  snapfire: { heroName: "Snapfire", positions: [4] },
  sniper: { heroName: "Sniper", positions: [1, 2] },
  spectre: { heroName: "Spectre", positions: [1] },
  spirit_breaker: { heroName: "Spirit Breaker", positions: [3, 4] },
  storm_spirit: { heroName: "Storm Spirit", positions: [2, 3] },
  sven: { heroName: "Sven", positions: [1, 3] },
  techies: { heroName: "Techies", positions: [4] },
  templar_assassin: { heroName: "Templar Assassin", positions: [2] },
  terrorblade: { heroName: "Terrorblade", positions: [1] },
  tidehunter: { heroName: "Tidehunter", positions: [3] },
  tinker: { heroName: "Tinker", positions: [2, 3] },
  tiny: { heroName: "Tiny", positions: [1, 3] },
  treant: { heroName: "Treant Protector", positions: [5] },
  troll_warlord: { heroName: "Troll Warlord", positions: [1, 2] },
  tusk: { heroName: "Tusk", positions: [3, 4] },
  undying: { heroName: "Undying", positions: [5] },
  ursa: { heroName: "Ursa", positions: [1] },
  vengefulspirit: { heroName: "Vengeful Spirit", positions: [4] },
  venomancer: { heroName: "Venomancer", positions: [4] },
  viper: { heroName: "Viper", positions: [1, 2] },
  visage: { heroName: "Visage", positions: [4] },
  void_spirit: { heroName: "Void Spirit", positions: [2, 3] },
  warlock: { heroName: "Warlock", positions: [5] },
  weaver: { heroName: "Weaver", positions: [1, 3] },
  windrunner: { heroName: "Windranger", positions: [2, 3] },
  winter_wyvern: { heroName: "Winter Wyvern", positions: [5] },
  wisp: { heroName: "Io", positions: [5] },
  witch_doctor: { heroName: "Witch Doctor", positions: [5] },
  zuus: { heroName: "Zeus", positions: [2, 3] },
};

export { takeDesktopScreenshot, delay, initialDraft, heroDetails };
