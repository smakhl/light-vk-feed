<script>
    import Attachment from './Attachment.svelte';

    export let item;

    const postUrl = `https://vk.com/wall${item.source_id}_${item.post_id}`;
    const date = new Date(item.date * 1000).toLocaleString('ru');
    const repost = item.copy_history && item.copy_history[0];
    const repostDate =
        repost && new Date(repost.date * 1000).toLocaleString('ru');
</script>

<!-- prettier-ignore -->
<div class="post">
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
