<script>
    import Feed from './components/Feed.svelte';
    import Credits from './components/Credits.svelte';
    import Navbar from './components/Navbar.svelte';
    import Filter from './components/Filter.svelte';
    import { getNews } from './vk/data/news';
    import { groupBy } from './utils/groupBy';
    import { auth, AUTH_STATUS } from './stores/auth';
    import { news, NEWS_STATUS } from './stores/news';
    import { isScrolledDown } from './stores/isScrolledDown';

    auth.subscribe((status) => {
        if (status === AUTH_STATUS.LOGGED_IN) {
            news.load();
        }
        if (status === AUTH_STATUS.LOGGED_OUT) {
            news.reset();
        }
    });

    news.subscribe((n) => {
        // console.log('n', n);
        window.n = n;
    });

    function handleLoginClick() {
        auth.login();
    }

    function markAllAsRead() {
        news.markFeedSeen();
    }

    news.onFeedChanged(backToTop);

    function backToTop() {
        window.scrollTo(0, 0);
    }
</script>

{#if !$isScrolledDown}
<Navbar />
{/if}
<!-- prettier-ignore -->
<main>
    <div class="top">
        {#if $auth === AUTH_STATUS.LOGGED_OUT}
            <p><button on:click={handleLoginClick}>Log in with VK</button></p>
        {:else if $auth === AUTH_STATUS.LOGGED_IN}
            <Feed />
        {:else}
            <p>Loading...</p>
        {/if}
    </div>
    
    {#if $auth === AUTH_STATUS.LOGGED_IN && 
        $news.status === NEWS_STATUS.LOADED && 
        $news.feed.length
    }
    <button on:click={markAllAsRead} class="refresh-button">
        Mark all as read
    </button>
    {/if}
    
    <Credits />

    {#if $news.status === NEWS_STATUS.LOADED && !$isScrolledDown}
        <Filter />
    {/if}
</main>

<style>
    :global(body) {
        padding-top: 42px;
    }
    main {
        padding: 8px;
        margin: auto;
        width: 100%;
        max-width: 500px;
        min-width: 300px;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        align-items: center;
    }
    .top {
        margin-bottom: auto;
        width: 100%;
    }
    .refresh-button {
        width: 70%;
        margin: 0.5em 0;
        padding: 1em;
    }
    .refresh-icon {
        width: 32px;
    }
    p {
        text-align: center;
    }
</style>
