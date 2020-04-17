<script>
    export let att;

    const photoSizes = Object.keys(att.photo).filter((k) =>
        k.includes('photo')
    );

    // fixme replace with screensize based size
    const medianQuality = Math.floor(photoSizes.length / 2);
    const photoSrc = att.photo[photoSizes[medianQuality]];
</script>

<!-- prettier-ignore -->
<img loading="lazy" src={photoSrc} alt="" srcset="">

<style>
    img {
        width: 100%;
    }
</style>
