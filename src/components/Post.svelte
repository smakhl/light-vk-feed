<script>
    import { onMount, onDestroy } from 'svelte';
    import { wrapUrls } from '../utils/wrapUrls';
    import Attachment from './Attachment.svelte';

    export let post;
    export let observer;
    export let showPostSource;
    export let width;

    const {
        postUrl,
        date,
        repost,
        sourceName,
        text,
        attachments,
        uid,
        seen,
    } = post;

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
    <div class="corner">
        {#if post.seen}
            <img class="seen-icon" src="./icons/eye.svg" alt="">
        {/if}
        <span class="date">{date}</span>
    </div>
    {#if showPostSource}
        <h4>{sourceName}</h4>
    {/if}
    {#if text}
        <p class="text">{@html wrapUrls(text)}</p>
    {/if}
    {#if attachments}
        {#each attachments as att, i}
           <Attachment {att} width="{width - 16*2}"></Attachment>
        {/each}
    {/if}
    {#if repost}
        <div class="post repost">
            <div class="corner">
                <span class="date">{repost.date}</span>
            </div>
            <h4>{repost.sourceName}</h4>
            {#if repost.text}
                <p class="text">{repost.text}</p>
            {/if}
            {#if repost.attachments}
                {#each repost.attachments as att, i}
                    <Attachment {att} width="{width - 16*4}"></Attachment>
                {/each}
            {/if}
        </div>
    {/if}
    <p><a href={postUrl} target="_blank">{postUrl}</a></p>
</div>

<style>
    .post {
        padding: 16px;
        padding-top: 2em;
        margin-bottom: 0.5em;
        position: relative;
        box-shadow: 0 0 3px rgb(128, 128, 128);
    }
    .text {
        white-space: pre-wrap;
        word-break: break-word;
    }
    .corner {
        position: absolute;
        top: 0.5em;
        right: 0.5em;
    }
    .date {
        color: #505050;
        font-size: 0.75em;
    }
    .seen {
        opacity: 0.8;
    }
    .seen-icon {
        height: 0.75em;
        width: 0.75em;
        vertical-align: middle;
        display: inline-block;
    }
</style>
