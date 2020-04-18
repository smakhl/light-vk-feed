<script>
    export let att;

    // fixme choose poster based on screen size
    const posterSrc = att.doc.preview.photo.sizes[0].src;
    const videoSrc =
        (att.doc.preview.video && att.doc.preview.video.src) || att.doc.url;
</script>

<style>
    video {
        width: 100%;
    }
</style>

<!-- prettier-ignore -->
<video
    src="{videoSrc}"
    poster="{posterSrc}"
    preload="none"
    controls
    type="video/mp4"
/>
