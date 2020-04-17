<script>
    import Link from './Link.svelte';
    import Photo from './Photo.svelte';
    import Video from './Video.svelte';
    export let att;
</script>

<!-- prettier-ignore -->
<div>
    {#if att.type === 'photo'}
        <Photo photo={att.photo}></Photo>
    {:else if att.type === 'video'}
        Video frame:
        <Photo photo={att.video}></Photo>
    {:else if att.type === 'doc' && att.doc.ext === 'gif'}
        <Video {att}></Video>
    {:else if att.type === 'link'}
        <Link {att}></Link>
    {:else}
        <p>Unsupported attachment: {JSON.stringify(att)}</p>
    {/if}
</div>

<style>
    p {
        word-break: break-word;
        max-width: 100%;
    }
</style>
