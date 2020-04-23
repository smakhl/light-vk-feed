<script>
    import Feed from './components/Feed.svelte';
    import { login, logout, getIsLoggedIn } from './vk/auth';
    import { getNews } from './vk/data/news';

    let error;
    let isLoggedIn;
    let news;

    (async () => {
        try {
            isLoggedIn = await getIsLoggedIn();
            if (isLoggedIn) {
                news = await getNews();
            }
        } catch (e) {
            error = e;
        }
    })();

    async function handleLogoutClick() {
        if (!confirm('Are you sure?')) {
            return;
        }

        await logout();
        isLoggedIn = false;
        news = undefined;
        localStorage.clear();
    }

    async function handleLoginClick() {
        try {
            isLoggedIn = await login();
            if (isLoggedIn) {
                news = await getNews();
            }
        } catch (e) {
            error = e;
        }
    }

    let readNewsCount = 0;
    function updateReadCount() {
        readNewsCount = news.filter((n) => n.seen).length;
    }

    async function markAllAsReadAndRefresh() {
        news.forEach((n) => {
            n.markSeen();
        });
        refresh();
    }

    async function refresh() {
        window.scrollTo(0, 0);
        news = undefined;
        news = await getNews();
        updateReadCount();
    }
</script>

<!-- prettier-ignore -->
<nav>
    {#if news}
        <span class="read-counter">
            {readNewsCount}/{news.length}
        </span>
    {/if}
    {#if isLoggedIn}
        <button on:click={handleLogoutClick} id="logout">Logout</button>
    {/if}
</nav>
<!-- prettier-ignore -->
<main>
    {#if isLoggedIn === false}
        <p class="centered">
            <button on:click={handleLoginClick}>Log in with VK</button>
        </p>
    {:else if news}
        {#if news.length > 0}
            <Feed posts={news} onPostRead={updateReadCount}></Feed>
        {:else}
            <p class="centered">There's nothing new in your feed! Well done!</p>
        {/if}
        <p class="centered">
            <button on:click={markAllAsReadAndRefresh} class="refresh-button">Refresh</button>
        </p>
    {:else if error}
        <p class="centered" style="color: red;">{error.message}</p>
    {:else}
        <p class="centered">Loading...</p>
    {/if}
</main>

<style>
    nav {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;

        background-color: #68a5eb;
        height: 42px;

        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        z-index: 1;
    }
    .read-counter {
        color: #fff;
        margin-left: 24px;
        margin-right: auto;
    }
    main {
        margin: 42px auto 0;
        padding: 8px;
        max-width: 500px;
    }
    #logout {
        margin: 0;
        margin-right: 8px;
        font-size: 12px;
    }
    .centered {
        text-align: center;
    }
    .refresh-button {
        letter-spacing: 2px;
        width: 100%;
        margin: 0.5em 0;
    }
</style>
