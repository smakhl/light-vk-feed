<script>
    import { selectPhoto } from '../utils/selectPhoto';

    export let att;

    const photoSrc = att.link.photo && selectPhoto(att.link.photo, 130);
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
