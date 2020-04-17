<script>
    import Attachment from './Attachment.svelte';

    export let source;
    export let text;
    export let item;

    const postUrl = `https://vk.com/wall${item.source_id}_${item.post_id}`;
</script>

<!-- prettier-ignore -->
<div class="post">
    <h4>{source}</h4>
    {#if text}
        <p class="text">{text}</p>
    {/if}
    {#if item.attachments}
        {#each item.attachments as att, i}
           <Attachment {att}></Attachment>
        {/each}
    {/if}
    <p><a href={postUrl} target="_blank">{postUrl}</a></p>
    <p class="date">
        {(new Date(item.date * 1000)).toLocaleString('ru')}
    </p>
</div>

<style>
    .post {
        border: 1px solid #bada55;
        padding: 1em;
        margin-bottom: 0.5em;
        position: relative;
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
</style>
