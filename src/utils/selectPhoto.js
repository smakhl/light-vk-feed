export function selectPhoto(obj, widthLargerThan) {
    const photos = Object.keys(obj).filter((k) => k.includes('photo'));

    let photoSrc;
    for (let i = 0; i < photos.length; i++) {
        const photoSize = photos[i].split('_')[1];

        if (photoSize >= widthLargerThan || i === photos.length - 1) {
            photoSrc = obj[photos[i]];
            break;
        }
    }

    return photoSrc;
}
