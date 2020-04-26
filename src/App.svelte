<script>
    import Feed from './components/Feed.svelte';
    import Credits from './components/Credits.svelte';
    import Navbar from './components/Navbar.svelte';
    import Filter from './components/Filter.svelte';
    import { getNews } from './vk/data/news';
    import { groupBy } from './utils/groupBy';
    import { auth, AUTH_STATUS } from './stores/auth';
    import { news, NEWS_STATUS } from './stores/news';

    auth.subscribe((status) => {
        if (status === AUTH_STATUS.LOGGED_IN) {
            news.load();
        }
        if (status === AUTH_STATUS.LOGGED_OUT) {
            news.reset();
        }
    });

    function handleLoginClick() {
        auth.login();
    }

    function markAllAsReadAndRefresh() {
        news.markFeedSeen();
        news.load();
    }

    news.onFeedChanged(() => {
        window.scrollTo(0, 0);
    });
</script>

<Navbar />
<!-- prettier-ignore -->
<main>
    <div class="top">
        {#if $auth === AUTH_STATUS.LOGGED_OUT}
            <p class="centered">
                <button on:click={handleLoginClick}>Log in with VK</button>
            </p>
        {:else if $auth === AUTH_STATUS.LOGGED_IN}
            {#if $news.status === NEWS_STATUS.LOADED}
                {#if $news.feed.length > 0}
                    <Feed />
                {:else}
                    <p class="centered">There's nothing new in your feed! Well done!</p>
                {/if}
            {:else}
                <p class="centered">Loading posts...</p>
            {/if}
        {:else}
            <p class="centered">Loading...</p>
        {/if}
    </div>
    
    <div class="bottom">
        {#if $auth === AUTH_STATUS.LOGGED_IN && $news.status === NEWS_STATUS.LOADED}
            <p class="centered">
                <button on:click={markAllAsReadAndRefresh} class="refresh-button">
                    <img class="refresh-icon" src="icons/refresh.svg" alt="">
                </button>
            </p>
        {/if}
        <p class="credits centered">
            <Credits />
        </p>
    </div>

    {#if Object.keys($news.feeds).length > 2 }
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
        max-width: 500px;
        min-width: 300px;
        height: 100%;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
    }
    .bottom {
        margin-top: auto;
    }
    .centered {
        text-align: center;
    }
    .refresh-button {
        width: 70%;
        margin: 0.5em 0;
        padding: 1em;
    }
    .refresh-icon {
        width: 32px;
    }
    .credits {
        margin-bottom: 8px;
        font-size: 0.8em;
    }
</style>
