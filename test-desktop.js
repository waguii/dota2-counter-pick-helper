import clipboardListener from 'clipboard-listener';

class ClipboardMonitor {
    constructor(options = {}) {
        this.options = {
            saveDirectory: options.saveDirectory || './clipboard_content',
            saveImages: options.saveImages !== false,
            saveText: options.saveText !== false,
            imageFormat: options.imageFormat || 'png',
            onTextCopy: options.onTextCopy || this.defaultTextHandler,
            onImageCopy: options.onImageCopy || this.defaultImageHandler,
            onError: options.onError || this.defaultErrorHandler
        };

        // Initialize listener
        this.listener = null;
    }

    start() {
        if (this.listener) {
            console.warn('Clipboard monitor is already running');
            return;
        }

        this.listener = new clipboardListener({
            // Watch for clipboard changes
            timeInterval: 250, // Check every 250ms

            // Handle clipboard changes
            onDataChanged: async (newData) => {
                console.log('Clipboard data changed:', newData);
            }
        });

        console.log('Clipboard monitor started');
        return this;
    }

    stop() {
        if (this.listener) {
            this.listener.stop();
            this.listener = null;
            console.log('Clipboard monitor stopped');
        }
        return this;
    }

    isRunning() {
        return !!this.listener;
    }
}

// Example usage
const monitor = new ClipboardMonitor({


});

// Start monitoring
monitor.start();

// Example of stopping after 1 hour
setTimeout(() => {
    monitor.stop();
    console.log('Monitoring stopped after 1 hour');
}, 3600000);
