<script>
    export let photo;

    const photos = Object.keys(photo).filter((k) => k.includes('photo'));
    console.log('photos', photos);

    let photoSrc;
    for (let i = 0; i < photos.length; i++) {
        const photoSize = photos[i].split('_')[1];

        if (photoSize >= 600 || i === photos.length - 1) {
            photoSrc = photo[photos[i]];
            console.log("photoSize", photoSize)
            break;
        }
    }

    
</script>

<!-- prettier-ignore -->
<img loading="lazy" src={photoSrc} alt="" srcset="">

<style>
    img {
        width: 100%;
    }
</style>
