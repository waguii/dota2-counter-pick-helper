import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import cv from "@u4/opencv4nodejs";

class DotaHeroDetector {
    constructor(config) {
        this.heroGridPositions = {}; // Will store hero positions from config
        this.pickedHeroImages = {}; // Reference images for picked heroes
        this.bannedLineColor = [255, 0, 0]; // Red color for ban lines
        this.topBarPositions = {
            radiant: { left: 208, top: 0, width: 615, height: 70 },  // Adjust these values
            dire: { left: 1098, top: 0, width: 615, height: 70 }    // Adjust these values
        };
    }

    async initialize(pickedHeroImagesDir) {
        // Load hero positions from config
        this.heroGridPositions = {
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
            'slardar': { x: 644, y: 294, width: 44, height: 75 },
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
        // Load picked hero reference images
        const files = await fs.readdir(pickedHeroImagesDir);
        for (const file of files) {
            const heroName = path.basename(file, path.extname(file));
            this.pickedHeroImages[heroName] = await sharp(path.join(pickedHeroImagesDir, file)).toBuffer();
        }
    }

    async findImageInImage(source, templateBuffer, threshold = 0.80, debug = false) {
        try {
            // Read the source and template images
            const template = cv.imdecode(new Uint8Array(templateBuffer), cv.IMREAD_COLOR);
    
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
                    60  // Set minimum height to prevent too small templates
                );
                
                return calculatedHeight;
            };
    
            // Get the appropriate height for this source image
            const newHeight = 66;//getTemplateHeight(sourceWidth, sourceHeight);
            
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
                console.log(`Found match at ${x}, ${y} with confidence ${minMax.maxVal}`);
                if (debug) {
                    console.log(`Template resized to ${newWidth}x${newHeight}`);
                    // Draw a rectangle where match was found on original image
                    source.drawRectangle(
                        new cv.Rect(
                            x,
                            y,
                            templateResized.cols,
                            templateResized.rows
                        ),
                        new cv.Vec(0, 255, 0),
                        2,
                        cv.LINE_8
                    );
                    // Show the image
                    cv.imshow('source', source);
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
                message: `Error: ${error.message}`
            };
        }
    }

    async getPickedHeroes(imageBuffer) {

        const result = [];
        const source = cv.imdecode(new Uint8Array(imageBuffer), cv.IMREAD_COLOR);

        for (const [heroName, heroImageBuffer] of Object.entries(this.pickedHeroImages)) {
            const exists = await this.findImageInImage(source, heroImageBuffer, 0.75, false);
            if (exists) {
                result.push(heroName);
            }
        }
        
        return result;
    }

    async getBannedHeroes(imageBuffer) {
        const result = [];
        for (const [heroName, position] of Object.entries(this.heroGridPositions)) {
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

            const isBanned = this.detectRedLine(heroRegion, position.width, position.height);

            if (isBanned) {
                result.push(heroName);
            }
        }
        return result;
    }

    async getDraft(imagePath) {

        const status = {
            banned: [],
            picked: {
                radiant: [],
                dire: []
            }
        };

        const image = await sharp(imagePath);
        const imageBuffer = await image.toBuffer();
        const { width, height } = await image.metadata();

        const radiantPickRegion = await sharp(imageBuffer)
            .extract({ left: 0, top: 0, width: (width / 2), height: (height / 6) })
            .toBuffer();

        const direPickRegion = await sharp(imageBuffer)
            .extract({ left: (width / 2), top: 0, width: (width / 2), height: (height / 6) })
            .toBuffer();

        //TODO need to check for the count of banned heroes

        status.banned = await this.getBannedHeroes(imageBuffer);
        status.picked.dire = await this.getPickedHeroes(direPickRegion);
        status.picked.radiant = await this.getPickedHeroes(radiantPickRegion);

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

        // this.saveHeroRegion(heroRegion, heroName);

        // Simple detection of red diagonal line for bans
        status.banned = this.detectRedLine(heroRegion, position.width, position.height);

        // Check if hero is picked by looking at top bar
        if (!status.banned) {
            status.picked = await this.checkIfPicked(imageBuffer);
        }

        return status;
    }

    async saveRegion(heroRegion, name, width, height) {
        // Save the region as PNG
        const outputDir = './pick_regions';  // Directory to save the images
        try {
            // Create directory if it doesn't exist
            await fs.mkdir(outputDir, { recursive: true });

            // Create new Sharp instance for saving PNG
            await sharp(heroRegion, {
                raw: {
                    width: width,
                    height: height,
                    channels: 3
                }
            }).toFile(`${outputDir}/${name}_region.png`);

        } catch (error) {
            console.error(`Error saving pick region for ${name}:`, error);
        }
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
        // if (lineDetected){
        //     try {
        //         sharp(markedBuffer, {
        //             raw: {
        //                 width: width,
        //                 height: height,
        //                 channels: 3
        //             }
        //         }).toFile(`./hero_regions/debug_points_${Date.now()}.png`);
        //     } catch (error) {
        //         console.error('Error saving debug image:', error);
        //     }
        // }

        console.log(`Diagonal red pixels found: ${diagonalLineCount}, Threshold: ${threshold}, Detected: ${lineDetected}`);

        return lineDetected;
    }
   
}

// Example usage
async function main() {
    const detector = new DotaHeroDetector();
    // Initialize the detector
    await detector.initialize('./hero_pick_images');
    console.time("getDraft");
    // Detect hero status from an image
    const status = await detector.getDraft('./draft-screen-ban.png');
    console.log('Hero Status:', status);
    console.timeEnd("getDraft");
}

export default DotaHeroDetector;