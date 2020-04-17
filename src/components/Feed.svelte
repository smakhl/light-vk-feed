<script>
    import { getNews } from '../vk/data/news';
    import Post from './Post.svelte';

    let waitNewsLoaded = getNews();
</script>

<!-- prettier-ignore -->
<div class="feed">
    {#await waitNewsLoaded}
        <p>...loading</p>
    {:then news}
        {#each news as newsItem, i}
            <Post {...newsItem}></Post>
        {/each}
    {:catch error}
        <p style="color: red;">{error.message}</p>
    {/await}
</div>

<style>
    .feed {
        padding: 8px;
    }
</style>
