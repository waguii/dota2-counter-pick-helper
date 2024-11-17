import screenshot from 'screenshot-desktop';
import sharp from "sharp";

async function takeDesktopScreenshot(display = 0) {
    try {
        const displays = await screenshot.listDisplays();

        if (display === 0 || display >= displays.length) {
            display = displays[0].id;
        }else{
            display = displays[display].id;
        }

        const result = await screenshot({ format: 'png', screen: display });

        // await sharp(result).removeAlpha().toFile(`screenshot.png`);

        return await sharp(result).removeAlpha().toBuffer();

    } catch (error) {
        console.error('Error taking desktop screenshot:', error);
    }
}

const delay = (time) => {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

export {takeDesktopScreenshot, delay};