<script>
    import Post from './Post.svelte';
    export let news;
</script>

<!-- prettier-ignore -->
<div class="feed">
    {#each news as newsItem, i}
        <Post {...newsItem}></Post>
    {/each}
</div>

<style>
    .feed {
        padding: 8px;
    }
</style>
