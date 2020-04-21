<script>
    import { onMount, onDestroy } from 'svelte';
    import Attachment from './Attachment.svelte';

    export let post;
    export let observer;

    const { postUrl, date, repost, sourceName, text, attachments, uid } = post;

    let container;
    onMount(() => {
        if (!observer) return;
        observer.observe(container);
    });
    onDestroy(() => {
        if (!observer) return;
        observer.unobserve(container);
    });
</script>

<!-- prettier-ignore -->
<div 
    bind:this={container} 
    class="post"
    class:seen={post.seen} 
    data-post-uid={uid}
>
    <p class="date">{date}</p>
    <h4>{sourceName}</h4>
    {#if text}
        <p class="text">{text}</p>
    {/if}
    {#if attachments}
        {#each attachments as att, i}
           <Attachment {att}></Attachment>
        {/each}
    {/if}
    {#if repost}
        <div class="post">
            <p class="date">{repost.date}</p>
            <h4>{repost.sourceName}</h4>
            {#if repost.text}
                <p class="text">{repost.text}</p>
            {/if}
            {#if repost.attachments}
                {#each repost.attachments as att, i}
                    <Attachment {att}></Attachment>
                {/each}
            {/if}
        </div>
    {/if}
    <p><a href={postUrl} target="_blank">{postUrl}</a></p>
</div>

<style>
    .post {
        padding: 1em;
        margin-bottom: 0.5em;
        position: relative;
        box-shadow: 0 0 3px rgb(128, 128, 128);
    }
    .text {
        white-space: pre-wrap;
        word-break: break-word;
    }
    .date {
        color: #505050;
        position: absolute;
        top: 0.5em;
        right: 0.5em;
        font-size: 0.75em;
        margin: 0;
    }
    .seen {
        opacity: 0.5;
    }
</style>
