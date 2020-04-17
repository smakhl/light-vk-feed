<script>
    import Link from './Link.svelte';
    import Photo from './Photo.svelte';
    import Video from './Video.svelte';
    export let att;
</script>

<!-- prettier-ignore -->
<div>
    {#if att.type === 'photo'}
        <Photo {att}></Photo>
    {:else if att.type === 'doc'}
        <Video {att}></Video>
    {:else if att.type === 'link'}
        <Link {att}></Link>
    {:else}
        <p>Unsupported attachment type: {att.type}</p>
    {/if}
</div>

<style>
</style>
