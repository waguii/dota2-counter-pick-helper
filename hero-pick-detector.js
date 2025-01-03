import cv from "@u4/opencv4nodejs";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

class DotaHeroDetector {
  constructor(config) {
    this.pickedHeroImagesDir = './hero_pick_images'; // Directory with reference images for picked heroes
    this.heroGridPositions = {}; // Will store hero positions from config
    this.pickedHeroImages = {}; // Reference images for picked heroes
    this.bannedLineColor = [255, 0, 0]; // Red color for ban lines
    this.topBarPositions = {
      radiant: { left: 208, top: 0, width: 615, height: 70 }, // Adjust these values
      dire: { left: 1098, top: 0, width: 615, height: 70 }, // Adjust these values
    };
  }

  async initialize() {
    // Load hero positions from config
    this.heroGridPositions = {
      //strength
      alchmist: { x: 134, y: 210, width: 44, height: 75 },
      axe: { x: 185, y: 210, width: 44, height: 75 },
      bristleback: { x: 236, y: 210, width: 44, height: 75 },
      centaur: { x: 287, y: 210, width: 44, height: 75 },
      chaos_knight: { x: 338, y: 210, width: 44, height: 75 },
      dawnbreaker: { x: 389, y: 210, width: 44, height: 75 },
      doom: { x: 440, y: 210, width: 44, height: 75 },
      dragon_knight: { x: 491, y: 210, width: 44, height: 75 },
      earth_spirit: { x: 542, y: 210, width: 44, height: 75 },
      earthshaker: { x: 593, y: 210, width: 44, height: 75 },
      elder_titan: { x: 644, y: 210, width: 44, height: 75 },
      primordial: { x: 134, y: 294, width: 44, height: 75 },
      huskar: { x: 185, y: 294, width: 44, height: 75 },
      kunkka: { x: 236, y: 294, width: 44, height: 75 },
      legion_commander: { x: 287, y: 294, width: 44, height: 75 },
      life_stealer: { x: 338, y: 294, width: 44, height: 75 },
      mars: { x: 389, y: 294, width: 44, height: 75 },
      night_stalker: { x: 440, y: 294, width: 44, height: 75 },
      ogre_magi: { x: 491, y: 294, width: 44, height: 75 },
      omniknight: { x: 542, y: 294, width: 44, height: 75 },
      pudge: { x: 593, y: 294, width: 44, height: 75 },
      slardar: { x: 644, y: 294, width: 44, height: 75 },
      spirit_breaker: { x: 134, y: 378, width: 44, height: 75 },
      sven: { x: 184, y: 378, width: 44, height: 75 },
      tidehunter: { x: 235, y: 378, width: 44, height: 75 },
      timbersaw: { x: 286, y: 378, width: 44, height: 75 },
      tiny: { x: 337, y: 378, width: 44, height: 75 },
      treant_protector: { x: 388, y: 378, width: 44, height: 75 },
      tusk: { x: 439, y: 378, width: 44, height: 75 },
      underlord: { x: 490, y: 378, width: 44, height: 75 },
      undying: { x: 541, y: 378, width: 44, height: 75 },
      wraith_king: { x: 592, y: 376, width: 44, height: 75 },
      //intelligence
      ancient_apparition: { x: 134, y: 495, width: 44, height: 75 },
      cristal_maiden: { x: 185, y: 495, width: 44, height: 75 },
      death_prophet: { x: 236, y: 495, width: 44, height: 75 },
      disruptor: { x: 287, y: 495, width: 44, height: 75 },
      enchantress: { x: 338, y: 495, width: 44, height: 75 },
      grimstroke: { x: 389, y: 495, width: 44, height: 75 },
      jakiro: { x: 440, y: 495, width: 44, height: 75 },
      keeper_of_the_light: { x: 491, y: 495, width: 44, height: 75 },
      leshrac: { x: 542, y: 495, width: 44, height: 75 },
      lich: { x: 593, y: 495, width: 44, height: 75 },
      lina: { x: 644, y: 495, width: 44, height: 75 },
      lion: { x: 134, y: 579, width: 44, height: 75 },
      ringmaster: { x: 185, y: 579, width: 44, height: 75 },
      muerta: { x: 236, y: 579, width: 44, height: 75 },
      furion: { x: 287, y: 579, width: 44, height: 75 },
      necrolyte: { x: 338, y: 579, width: 44, height: 75 },
      oracle: { x: 389, y: 579, width: 44, height: 75 },
      outworld_destroyer: { x: 440, y: 579, width: 44, height: 75 },
      puck: { x: 491, y: 579, width: 44, height: 75 },
      pugna: { x: 542, y: 579, width: 44, height: 75 },
      queen_of_pain: { x: 593, y: 579, width: 44, height: 75 },
      rubick: { x: 644, y: 579, width: 44, height: 75 },
      shadow_demon: { x: 134, y: 661, width: 44, height: 75 },
      shadow_shaman: { x: 184, y: 661, width: 44, height: 75 },
      silencer: { x: 235, y: 661, width: 44, height: 75 },
      skywrath_mage: { x: 286, y: 661, width: 44, height: 75 },
      storm_spirit: { x: 337, y: 661, width: 44, height: 75 },
      tinker: { x: 388, y: 661, width: 44, height: 75 },
      warlock: { x: 439, y: 661, width: 44, height: 75 },
      witch_doctor: { x: 490, y: 661, width: 44, height: 75 },
      zuus: { x: 541, y: 661, width: 44, height: 75 },
      //agility
      anti_mage: { x: 727, y: 210, width: 44, height: 75 },
      arc_warden: { x: 778, y: 210, width: 44, height: 75 },
      bloodseeker: { x: 829, y: 210, width: 44, height: 75 },
      bounty_hunter: { x: 880, y: 210, width: 44, height: 75 },
      clinkz: { x: 931, y: 210, width: 44, height: 75 },
      drow_ranger: { x: 982, y: 210, width: 44, height: 75 },
      ember_spirit: { x: 1033, y: 210, width: 44, height: 75 },
      faceless_void: { x: 1084, y: 210, width: 44, height: 75 },
      gyrocopter: { x: 1135, y: 210, width: 44, height: 75 },
      hoodwink: { x: 1186, y: 210, width: 44, height: 75 },
      juggernaut: { x: 1237, y: 210, width: 44, height: 75 },
      kez: { x: 727, y: 294, width: 44, height: 75 },
      luna: { x: 778, y: 294, width: 44, height: 75 },
      medusa: { x: 829, y: 294, width: 44, height: 75 },
      meepo: { x: 880, y: 294, width: 44, height: 75 },
      monkey_king: { x: 931, y: 294, width: 44, height: 75 },
      morphling: { x: 982, y: 294, width: 44, height: 75 },
      naga_siren: { x: 1033, y: 294, width: 44, height: 75 },
      phantom_assassin: { x: 1084, y: 294, width: 44, height: 75 },
      phantom_lancer: { x: 1135, y: 294, width: 44, height: 75 },
      razor: { x: 1186, y: 294, width: 44, height: 75 },
      riki: { x: 1237, y: 294, width: 44, height: 75 },
      shadow_fiend: { x: 727, y: 376, width: 44, height: 75 },
      slark: { x: 778, y: 376, width: 44, height: 75 },
      sniper: { x: 829, y: 376, width: 44, height: 75 },
      spectre: { x: 880, y: 376, width: 44, height: 75 },
      templar_assassin: { x: 931, y: 376, width: 44, height: 75 },
      terrorblade: { x: 982, y: 376, width: 44, height: 75 },
      troll_warlord: { x: 1033, y: 376, width: 44, height: 75 },
      ursa: { x: 1084, y: 376, width: 44, height: 75 },
      viper: { x: 1135, y: 376, width: 44, height: 75 },
      weaver: { x: 1186, y: 376, width: 44, height: 75 },
      //Universal
      abaddon: { x: 727, y: 495, width: 44, height: 75 },
      bane: { x: 778, y: 495, width: 44, height: 75 },
      batrider: { x: 829, y: 495, width: 44, height: 75 },
      beastmaster: { x: 880, y: 495, width: 44, height: 75 },
      brewmaster: { x: 931, y: 495, width: 44, height: 75 },
      broodmother: { x: 982, y: 495, width: 44, height: 75 },
      chen: { x: 1033, y: 495, width: 44, height: 75 },
      clockwerk: { x: 1084, y: 495, width: 44, height: 75 },
      dark_seer: { x: 1135, y: 495, width: 44, height: 75 },
      dark_willow: { x: 1186, y: 495, width: 44, height: 75 },
      dazzle: { x: 1237, y: 495, width: 44, height: 75 },
      enigma: { x: 727, y: 578, width: 44, height: 75 },
      invoker: { x: 778, y: 578, width: 44, height: 75 },
      io: { x: 829, y: 578, width: 44, height: 75 },
      lone_druid: { x: 880, y: 578, width: 44, height: 75 },
      lycan: { x: 931, y: 578, width: 44, height: 75 },
      magnus: { x: 982, y: 578, width: 44, height: 75 },
      marci: { x: 1033, y: 578, width: 44, height: 75 },
      mirana: { x: 1084, y: 578, width: 44, height: 75 },
      nyx_assassin: { x: 1135, y: 578, width: 44, height: 75 },
      pangolier: { x: 1186, y: 578, width: 44, height: 75 },
      phoenix: { x: 1237, y: 578, width: 44, height: 75 },
      sand_king: { x: 727, y: 661, width: 44, height: 75 },
      snapfire: { x: 778, y: 661, width: 44, height: 75 },
      techies: { x: 829, y: 661, width: 44, height: 75 },
      vengeful_spirit: { x: 880, y: 661, width: 44, height: 75 },
      venonancer: { x: 931, y: 661, width: 44, height: 75 },
      visage: { x: 982, y: 661, width: 44, height: 75 },
      void_spirit: { x: 1033, y: 661, width: 44, height: 75 },
      windrunner: { x: 1084, y: 661, width: 44, height: 75 },
      winter_wyvern: { x: 1135, y: 661, width: 44, height: 75 },
    };
    // Load picked hero reference images
    const files = await fs.readdir(this.pickedHeroImagesDir);
    for (const file of files) {
      const heroName = path.basename(file, path.extname(file));
      this.pickedHeroImages[heroName] = await sharp(
        path.join(this.pickedHeroImagesDir, file)
      ).toBuffer();
    }
  }

  async findImageInImage(
    source,
    templateBuffer,
    threshold = 0.8,
    debug = false
  ) {
    try {
      // Read the source and template images
      const template = cv.imdecode(
        new Uint8Array(templateBuffer),
        cv.IMREAD_COLOR
      );

      // Get source and template dimensions
      const sourceWidth = source.sizes[1];
      const sourceHeight = source.sizes[0];
      const tWidth = template.sizes[1];
      const tHeight = template.sizes[0];

      // Calculate the appropriate template height based on source dimensions
      const getTemplateHeight = (sourceWidth, sourceHeight) => {
        // Based on your examples:
        // 1920x1080 -> 70px
        // 1384x725 -> 66px
        // We'll use the width as the primary scaling factor
        const referenceWidth = 1920;
        const referenceHeight = 70;

        // Calculate scaling factor
        const scaleFactor = sourceWidth / referenceWidth;

        // Calculate new height with a minimum bound
        const calculatedHeight = Math.max(
          Math.round(referenceHeight * scaleFactor),
          60 // Set minimum height to prevent too small templates
        );

        return calculatedHeight;
      };

      // Get the appropriate height for this source image
      const newHeight = 66; //getTemplateHeight(sourceWidth, sourceHeight);

      // Calculate new width to maintain aspect ratio
      const aspectRatio = tWidth / tHeight;
      const newWidth = Math.round(newHeight * aspectRatio);

      // Resize template
      const templateResized = template.resize(newHeight, newWidth);

      // Perform template matching
      const matched = source.matchTemplate(
        templateResized,
        cv.TM_CCOEFF_NORMED
      );

      const minMax = matched.minMaxLoc();
      const x = minMax.maxLoc.x;
      const y = minMax.maxLoc.y;

      if (minMax.maxVal >= threshold) {
        if (debug) {
          console.log(
            `Found match at ${x}, ${y} with confidence ${minMax.maxVal}`
          );
          console.log(`Template resized to ${newWidth}x${newHeight}`);
          // Draw a rectangle where match was found on original image
          source.drawRectangle(
            new cv.Rect(x, y, templateResized.cols, templateResized.rows),
            new cv.Vec(0, 255, 0),
            2,
            cv.LINE_8
          );
          // Show the image
          cv.imshow("source", source);
          cv.waitKey();
        }
        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        matches: [],
        message: `Error: ${error.message}`,
      };
    }
  }

  async getPickedHeroes(imageBuffer) {
    const result = [];
    const source = cv.imdecode(new Uint8Array(imageBuffer), cv.IMREAD_COLOR);

    for (const [heroName, heroImageBuffer] of Object.entries(
      this.pickedHeroImages
    )) {
      const exists = await this.findImageInImage(
        source,
        heroImageBuffer,
        0.68,
        false
      );
      if (exists) {
        result.push(heroName);
      }
    }

    return result;
  }

  async getBannedHeroes(imageBuffer) {
    const threshold = 50;
    const result = [];
    for (const [heroName, position] of Object.entries(this.heroGridPositions)) {
      // Check for ban line (red diagonal line)
      const heroRegion = await sharp(imageBuffer)
        .extract({
          left: position.x,
          top: position.y,
          width: position.width,
          height: position.height,
        })
        .raw()
        .toBuffer();

      // Save the region as PNG for debugging
    //   await this.saveHeroRegion(heroRegion, heroName);

      const isBanned = this.detectRedLine(
        heroRegion,
        position.width,
        position.height,
        threshold,
        false
      );

      if (isBanned) {
        result.push(heroName);
      }
    }
    return result;
  }

  async getDraft(imageBuffer) {
    const status = {
      banned: [],
      picked: {
        radiant: [],
        dire: [],
      },
    };

    // const image = await sharp(`screenshot.png`);
    // const imageBuffer = await image.toBuffer();
    const { width, height } = await sharp(imageBuffer).metadata();

    const radiantPickRegion = await sharp(imageBuffer)
      .extract({ left: 0, top: 0, width: width / 2, height: height / 6 })
      .toBuffer();

    const direPickRegion = await sharp(imageBuffer)
      .extract({
        left: width / 2,
        top: 0,
        width: width / 2,
        height: height / 6,
      })
      .toBuffer();

    //TODO need to check for the count of banned heroes

    status.banned = await this.getBannedHeroes(imageBuffer);
    status.picked.dire = await this.getPickedHeroes(direPickRegion);
    status.picked.radiant = await this.getPickedHeroes(radiantPickRegion);

    return status;
  }

  async saveRegion(heroRegion, name, width, height) {
    // Save the region as PNG
    const outputDir = "./pick_regions"; // Directory to save the images
    try {
      // Create directory if it doesn't exist
      await fs.mkdir(outputDir, { recursive: true });

      // Create new Sharp instance for saving PNG
      await sharp(heroRegion, {
        raw: {
          width: width,
          height: height,
          channels: 3,
        },
      }).toFile(`${outputDir}/${name}_region.png`);
    } catch (error) {
      console.error(`Error saving pick region for ${name}:`, error);
    }
  }

  async saveHeroRegion(heroRegion, heroName) {
    // Save the region as PNG
    const outputDir = "./hero_regions"; // Directory to save the images
    try {
      // Create directory if it doesn't exist
      await fs.mkdir(outputDir, { recursive: true });

      // Create new Sharp instance for saving PNG
      await sharp(heroRegion, {
        raw: {
          width: 44,
          height: 75,
          channels: 3,
        },
      }).toFile(`${outputDir}/${heroName}_region.png`);
    } catch (error) {
      console.error(`Error saving hero region for ${heroName}:`, error);
    }
  }

  detectRedLine(regionBuffer, width, height, threshold = 50, debug = false) {
    let diagonalLineCount = 0;
    const tolerance = 2;

    // Rotation adjustment (positive values make it more vertical)
    // Range: -1.0 to 1.0 where:
    // -1.0 = more horizontal
    // 0.0 = perfect 45-degree diagonal
    // 1.0 = more vertical
    const rotationAdjust = 0.5333;

    // Create a copy of the buffer to mark detected points
    const markedBuffer = Buffer.from(regionBuffer);

    // Center point of the image
    const centerX = width / 2;
    const centerY = height / 2;

    // For each row

    for (let y = 0; y < height; y++) {
      // Calculate position relative to center
      const relativeY = y - centerY;

      // Inverse the X calculation to go from right to left
      // Changed the sign before centerX to start from the right side
      const expectedX = width - (centerX + relativeY * (1 - rotationAdjust));

      // Check pixels around the expected diagonal position
      for (let dx = -tolerance; dx <= tolerance; dx++) {
        const x = Math.floor(expectedX + dx);

        if (x < 0 || x >= width) continue;

        const pos = (y * width + x) * 3;

        if (pos + 2 < regionBuffer.length) {
          const r = regionBuffer[pos];
          const g = regionBuffer[pos + 1];
          const b = regionBuffer[pos + 2];

          if (r > 70 && r < 110 && g > 50 && g < 80 && b > 50 && b < 80) {
            // Mark the detected point in bright green
            markedBuffer[pos] = 0; // R
            markedBuffer[pos + 1] = 255; // G
            markedBuffer[pos + 2] = 0; // B

            diagonalLineCount++;
            break;
          }
        }
      }
    }

    const lineDetected = diagonalLineCount >= threshold;

    if (debug) {
      // Save the marked buffer as an image
      if (lineDetected) {
        try {
          sharp(markedBuffer, {
            raw: {
              width: width,
              height: height,
              channels: 3,
            },
          }).toFile(`./hero_regions/debug_points_${Date.now()}.png`);
        } catch (error) {
          console.error("Error saving debug image:", error);
        }
      }

      console.log(
        `Diagonal red pixels found: ${diagonalLineCount}, Threshold: ${threshold}, Detected: ${lineDetected}`
      );
    }

    return lineDetected;
  }
}

// Example usage
async function main() {
  const detector = new DotaHeroDetector();
  // Initialize the detector
  await detector.initialize("./hero_pick_images");
  console.time("getDraft");
  // Detect hero status from an image
  const status = await detector.getDraft("./draft-screen-ban.png");
  console.log("Hero Status:", status);
  console.timeEnd("getDraft");
}

// (async () => {
//   try {
//     await main();
//   } catch (error) {
//     console.error("Error in main:", error);
//   }
// })();

export default DotaHeroDetector;
