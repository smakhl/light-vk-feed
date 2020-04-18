<script>
    import Post from './Post.svelte';
    export let news;
</script>

<style>
    .feed {
        padding: 8px;
    }
</style>

<!-- prettier-ignore -->
<div class="feed">
    {#each news as item, i}
        <Post {item} />
    {/each}
</div>
