/**
 * Utility for fast client-side image compression using HTML5 Canvas.
 * Solves slow mobile uploads & memory bloat by resizing 5MB-15MB camera photos
 * into optimized ~50KB-100KB images before upload.
 */
export async function compressImage(
    file: File,
    maxWidth = 600,
    maxHeight = 600,
    quality = 0.85
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

            // Calculate scaled aspect ratio
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

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        resolve(file);
                        return;
                    }

                    // Convert blob back to File
                    const compressedFile = new File(
                        [blob],
                        file.name.replace(/\.[^/.]+$/, ".jpg"),
                        {
                            type: "image/jpeg",
                            lastModified: Date.now(),
                        }
                    );

                    resolve(compressedFile);
                },
                "image/jpeg",
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
