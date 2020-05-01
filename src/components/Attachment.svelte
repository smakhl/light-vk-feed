<script>
    import PostLink from './PostLink.svelte';
    import Photo from './Photo.svelte';
    import Video from './Video.svelte';
    export let att;
    export let width;
</script>

<!-- prettier-ignore -->
<div>
    {#if att.type === 'photo'}
        <Photo {width} photo={att.photo}></Photo>
    {:else if att.type === 'video'}
        <span>Video frame:</span>
        <Photo {width} photo={att.video}></Photo>
    {:else if att.type === 'doc' && att.doc.ext === 'gif'}
        <Video {att}></Video>
    {:else if att.type === 'doc' && att.doc.ext === 'pdf'}
        <p>Doc: {att.doc.title}</p>
    {:else if att.type === 'link'}
        <PostLink {att}></PostLink>
    {:else if att.type === 'podcast'}
        <p>Podcast: {att.podcast.title}</p>
    {:else if att.type === 'podcast'}
        <p>Unsupported attachment: {JSON.stringify(att)}</p>
    {/if}
</div>

<style>
    p,
    span {
        word-break: break-word;
        max-width: 100%;
        font-style: italic;
    }
</style>
