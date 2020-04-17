<script>
    export let att;

    let photoSrc;
    if (att.link.photo) {
        const photoSizes = Object.keys(att.link.photo).filter((k) =>
            k.includes('photo')
        );

        // fixme replace with screensize based size
        const medianQuality = Math.floor(photoSizes.length / 2);
        photoSrc = att.link.photo[photoSizes[medianQuality]];
    }
</script>

<!-- prettier-ignore -->
<a href="{att.link.url}" target="_blank">
    <div class="link">
        {#if photoSrc}
            <img loading="lazy" src="{photoSrc}" alt="" />
        {/if}
        <p>{att.link.title}</p>
    </div>
</a>

<style>
    img {
        width: 100%;
    }
    .link {
        display: flex;
        flex-direction: row;
        align-items: center;
        border: 1px solid rgba(0, 0, 0, 0.363);
    }
    .link img {
        flex-shrink: 0;
        height: 80px;
        width: auto;
    }
    .link p {
        margin: 0;
        padding: 8px;
    }
</style>
