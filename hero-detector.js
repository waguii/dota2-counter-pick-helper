import cv from "@u4/opencv4nodejs";

class DotaHeroDetector {
    constructor() {

    }

    findImageInImage(sourcePath, templatePath, threshold = 0.80, debug = false) {
        try {
            // Read the source and template images
            const source = cv.imread(sourcePath);
            const template = cv.imread(templatePath);
    
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
            const newHeight = getTemplateHeight(sourceWidth, sourceHeight);
            
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
                    console.log(`Found match at ${x}, ${y} with confidence ${minMax.maxVal}`);
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
}

(async () => {
    const heroDetector = new DotaHeroDetector();
    heroDetector.findImageInImage(
        'teste1.png',
        'hero_pick_images/vengefulspirit.png',
        0.60,
        true);
})();