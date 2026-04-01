export const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        // skip if the image already small
        if (file.size < 100 * 1024) return resolve(file);

        const img = new Image();
        const url = URL.createObjectURL(file);
        img.src = url;

        img.onload = () => {
            URL.revokeObjectURL(url);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas error'));

            // if the original image is smaller than 256, keep its original smallest side
            const size = Math.min(256, img.width, img.height);
            canvas.width = size;
            canvas.height = size;

            // calculate the center-crop math
            const scale = Math.max(size / img.width, size / img.height);

            // calculate how much to shift the image to center it
            const x = (size / scale - img.width) / 2;
            const y = (size / scale - img.height) / 2;

            // draw the cropped square onto the canvas
            ctx.drawImage(img, x, y, img.width, img.height, 0, 0, size, size);

            // export the canvas as new file
            const type = file.type === 'image/png' ? 'image/png' : 'image/webp';
            canvas.toBlob((blob) => {
                if (!blob) return reject(new Error('Compression failed'));

                const ext = type === 'image/png' ? '.png' : '.webp';

                resolve(
                    new File([blob], file.name.replace(/\.[^/.]+$/, ext), {
                        type,
                        lastModified: Date.now(),
                    })
                );
            }, type, 0.8);
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };
    });
};