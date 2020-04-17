<script>
    import Post from './Post.svelte';
    export let news;
</script>

<!-- prettier-ignore -->
<div class="feed">
    {#each news as item, i}
        <Post {item}></Post>
    {/each}
</div>

<style>
    .feed {
        padding: 8px;
    }
</style>
