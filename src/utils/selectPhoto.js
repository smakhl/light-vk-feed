export function selectPhoto(obj, containerWidth) {
    const photos = Object.keys(obj).filter((k) => k.includes('photo'));

    let photoSrc;
    for (let i = 0; i < photos.length; i++) {
        const photoSize = photos[i].split('_')[1];

        if (photoSize >= containerWidth || i === photos.length - 1) {
            photoSrc = obj[photos[i]];
            break;
        }
    }

    let size;
    if (obj.height) {
        size = getPhotoSize(obj, containerWidth);
    } else {
        size = {
            width: containerWidth,
        };
    }

    return {
        src: photoSrc,
        ...size,
    };
}

function getPhotoSize(
    { width: originalWidth, height: originalHeight },
    containerWidth
) {
    const ratio = originalWidth / originalHeight;

    const proportionalHeight = containerWidth / ratio;

    return {
        width: containerWidth,
        height: proportionalHeight,
    };
}
