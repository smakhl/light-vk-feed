<script>
    import { onMount, onDestroy } from 'svelte';
    import { makeDateFromUnixTime } from '../utils/makeDateFromUnixTime';
    import Attachment from './Attachment.svelte';

    export let item;
    export let observer;

    let container;
    onMount(() => {
        if (!observer) return;
        observer.observe(container);
    });
    onDestroy(() => {
        if (!observer) return;
        observer.unobserve(container);
    });

    const postUrl = `https://vk.com/wall${item.post_uid}`;
    const formatDate = (date) =>
        makeDateFromUnixTime(date).toLocaleString('ru');
    const date = formatDate(item.date);
    const repost = item.copy_history && item.copy_history[0];
    const repostDate = repost && formatDate(repost.date);
</script>

<!-- prettier-ignore -->
<div 
    bind:this={container} 
    class="post"
    class:seen={item.seen}
    data-post-uid={item.post_uid}
>
    <p class="date">{date}</p>
    <h4>{item.source_name}</h4>
    {#if item.text}
        <p class="text">{item.text}</p>
    {/if}
    {#if item.attachments}
        {#each item.attachments as att, i}
           <Attachment {att}></Attachment>
        {/each}
    {/if}
    {#if repost}
        <div class="post">
            <p class="date">{repostDate}</p>
            <h4>{repost.source_name}</h4>
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
