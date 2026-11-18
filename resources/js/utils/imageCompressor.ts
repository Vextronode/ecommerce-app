/**
 * Utility for fast client-side image compression using HTML5 Canvas.
 * Solves slow mobile uploads & memory bloat by converting and compressing
 * camera photos into optimized WebP/JPEG before upload without noticeable quality loss.
 */
export async function compressImage(
    file: File,
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.85,
    preferredFormat: "image/webp" | "image/jpeg" = "image/webp"
): Promise<File> {
    // If the file is already an SVG or gif, return as is
    if (file.type === "image/svg+xml" || file.type === "image/gif") {
        return file;
    }

    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);

            let { width, height } = image;

            // Calculate scaled aspect ratio only if image exceeds maxWidth or maxHeight
            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext("2d");
            if (!ctx) {
                resolve(file); // fallback to original if canvas context unavailable
                return;
            }

            // High-quality image smoothing
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(image, 0, 0, width, height);

            const extension = preferredFormat === "image/webp" ? ".webp" : ".jpg";
            const outputFileName = file.name.replace(/\.[^/.]+$/, "") + extension;

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }

                    // Convert blob back to File
                    const compressedFile = new File(
                        [blob],
                        outputFileName,
                        {
                            type: blob.type || preferredFormat,
                            lastModified: Date.now(),
                        }
                    );

                    resolve(compressedFile);
                },
                preferredFormat,
                quality
            );
        };

        image.onerror = (err) => {
            URL.revokeObjectURL(objectUrl);
            reject(err);
        };

        image.src = objectUrl;
    });
}
