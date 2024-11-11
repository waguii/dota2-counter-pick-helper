import { promises as fs } from 'fs';
import path, { dirname } from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DotaHeroDetector {
    constructor(config) {
        this.heroPositions = {}; // Will store hero positions from config
        this.pickedHeroImages = {}; // Reference images for picked heroes
        this.bannedLineColor = [255, 0, 0]; // Red color for ban lines
        this.topBarPositions = {
            radiant: { left: 0, top: 0, width: 500, height: 60 },  // Adjust these values
            dire: { left: 500, top: 0, width: 500, height: 60 }    // Adjust these values
        };
    }

    async initialize(heroPositionsConfig, pickedHeroImagesDir) {
        // Load hero positions from config
        this.heroPositions = heroPositionsConfig;

        // Load picked hero reference images
        const files = await fs.readdir(pickedHeroImagesDir);
        for (const file of files) {
            const heroName = path.basename(file, path.extname(file));
            this.pickedHeroImages[heroName] = await sharp(path.join(pickedHeroImagesDir, file))
                .toBuffer();
        }
    }

    async detectHeroStatus(imagePath) {
        const image = sharp(imagePath);
        const imageBuffer = await image.toBuffer();
        const { width, height } = await image.metadata();

        const status = {
            available: [],
            banned: [],
            picked: {
                radiant: [],
                dire: []
            }
        };

        //width 115px
        //height 70px

        // Check each hero position
        for (const [heroName, position] of Object.entries(this.heroPositions)) {
            const heroStatus = await this.checkHeroStatus(
                heroName,
                imageBuffer,
                position,
                width,
                height
            );

            if (heroStatus.banned) {
                status.banned.push(heroName);
            } else if (heroStatus.picked) {
                const team = await this.determineTeam(imageBuffer, heroName);
                status.picked[team].push(heroName);
            } else {
                status.available.push(heroName);
            }
        }

        return status;
    }

    async checkHeroStatus(heroName, imageBuffer, position, fullWidth, fullHeight) {
        const status = {
            banned: false,
            picked: false
        };

        // Check for ban line (red diagonal line)
        const heroRegion = await sharp(imageBuffer)
            .extract({
                left: position.x,
                top: position.y,
                width: position.width,
                height: position.height
            })
            .raw()
            .toBuffer();

        this.saveHeroRegion(heroRegion, heroName);

        // Simple detection of red diagonal line for bans
        status.banned = this.detectRedLine(heroRegion, position.width, position.height);

        // Check if hero is picked by looking at top bar
        if (!status.banned) {
            status.picked = await this.checkIfPicked(imageBuffer);
        }

        return status;
    }

    async saveHeroRegion(heroRegion, heroName) {
        // Save the region as PNG
        const outputDir = './hero_regions';  // Directory to save the images
        try {
            // Create directory if it doesn't exist
            await fs.mkdir(outputDir, { recursive: true });

            // Create new Sharp instance for saving PNG
            await sharp(heroRegion, {
                raw: {
                    width: 44,
                    height: 75,
                    channels: 3
                }
            }).toFile(`${outputDir}/${heroName}_region.png`);

        } catch (error) {
            console.error(`Error saving hero region for ${heroName}:`, error);
        }
    }

    detectRedLine(regionBuffer, width, height) {
        let diagonalLineCount = 0;
        const tolerance = 2;
        const threshold = 60;

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
            const expectedX = width - (centerX + (relativeY * (1 - rotationAdjust)));

            // Check pixels around the expected diagonal position
            for (let dx = -tolerance; dx <= tolerance; dx++) {
                const x = Math.floor(expectedX + dx);

                if (x < 0 || x >= width) continue;

                const pos = (y * width + x) * 3;

                if (pos + 2 < regionBuffer.length) {
                    const r = regionBuffer[pos];
                    const g = regionBuffer[pos + 1];
                    const b = regionBuffer[pos + 2];

                    if ((r > 70 && r < 110) && (g > 50 && g < 80) && (b > 50 && b < 80)) {
                        // Mark the detected point in bright green
                        markedBuffer[pos] = 0;      // R
                        markedBuffer[pos + 1] = 255;  // G
                        markedBuffer[pos + 2] = 0;    // B

                        diagonalLineCount++;
                        break;
                    }
                }
            }
        }

        const lineDetected = diagonalLineCount >= threshold;

        // Save the marked buffer as an image
        if (lineDetected){
            try {
                sharp(markedBuffer, {
                    raw: {
                        width: width,
                        height: height,
                        channels: 3
                    }
                }).toFile(`./hero_regions/debug_points_${Date.now()}.png`);
            } catch (error) {
                console.error('Error saving debug image:', error);
            }
        }

        console.log(`Diagonal red pixels found: ${diagonalLineCount}, Threshold: ${threshold}, Detected: ${lineDetected}`);

        return lineDetected;
    }

    async checkIfPicked(imageBuffer) {
        // Extract top bar regions for both teams
        const radiantRegion = await sharp(imageBuffer)
            .extract(this.topBarPositions.radiant)
            .toBuffer();

        const direRegion = await sharp(imageBuffer)
            .extract(this.topBarPositions.dire)
            .toBuffer();

        // Use template matching or similar technique to detect picked heroes
        // This is a simplified version - you'll need to implement actual matching logic
        return false; // Placeholder
    }

    async determineTeam(imageBuffer, heroName) {
        // Implement team detection logic based on hero position in top bar
        // This is a simplified version - you'll need to implement actual team detection
        return 'radiant'; // Placeholder
    }
}

// Example usage
async function main() {
    const detector = new DotaHeroDetector();
    //gap 7px
    // Hero positions configuration (you'll need to provide this)
    const heroPositionsConfig = {
        'alchmist': { x: 134, y: 210, width: 44, height: 75 },
        'axe': { x: 185, y: 210, width: 44, height: 75 },
        'bristleback': { x: 236, y: 210, width: 44, height: 75 },
        'centaur': { x: 287, y: 210, width: 44, height: 75 },
        'chaos_knight': { x: 338, y: 210, width: 44, height: 75 },
        'dawnbreaker': { x: 389, y: 210, width: 44, height: 75 },
        'doom': { x: 440, y: 210, width: 44, height: 75 },
        'dragon_knight': { x: 491, y: 210, width: 44, height: 75 },
        'earth_spirit': { x: 542, y: 210, width: 44, height: 75 },
        'earthshaker': { x: 593, y: 210, width: 44, height: 75 },
        'elder_titan': { x: 644, y: 210, width: 44, height: 75 },
        'primordial': { x: 134, y: 294, width: 44, height: 75 },
        'huskar': { x: 185, y: 294, width: 44, height: 75 },
        'kunkka': { x: 236, y: 294, width: 44, height: 75 },
        'legion_commander': { x: 287, y: 294, width: 44, height: 75 },
        'life_stealer': { x: 338, y: 294, width: 44, height: 75 },
        'mars': { x: 389, y: 294, width: 44, height: 75 },
        'night_stalker': { x: 440, y: 294, width: 44, height: 75 },
        'ogre_magi': { x: 491, y: 294, width: 44, height: 75 },
        'omniknight': { x: 542, y: 294, width: 44, height: 75 },
        'pudge': { x: 593, y: 294, width: 44, height: 75 },
        'slardar' : { x: 644, y: 294, width: 44, height: 75 },
        'spirit_breaker': { x: 134, y: 378, width: 44, height: 75 },
        'sven': { x: 184, y: 378, width: 44, height: 75 },
        'tidehunter': { x: 235, y: 378, width: 44, height: 75 },
        'timbersaw': { x: 286, y: 378, width: 44, height: 75 },
        'tiny': { x: 337, y: 378, width: 44, height: 75 },
        'treant_protector': { x: 388, y: 378, width: 44, height: 75 },
        'tusk': { x: 439, y: 378, width: 44, height: 75 },
        'underlord': { x: 490, y: 378, width: 44, height: 75 },
        'undying': { x: 541, y: 378, width: 44, height: 75 },
        'wraith_king': { x: 592, y: 376, width: 44, height: 75 },
        'ancient_apparition': { x: 134, y: 495, width: 44, height: 75 },
        // Add more hero positions...
    };

    // Initialize the detector
    await detector.initialize(
        heroPositionsConfig,
        './hero_pick_images'
    );

    // Detect hero status from an image
    const status = await detector.detectHeroStatus('./draft-screen-ban.png');

    console.log('Hero Status:', status);
}

(async () => {
    main();
})();


export default DotaHeroDetector;