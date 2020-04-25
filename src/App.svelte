<script>
    import Feed from './components/Feed.svelte';
    import Credits from './components/Credits.svelte';
    import { login, logout, getIsLoggedIn } from './vk/auth';
    import { getNews } from './vk/data/news';

    let error;
    let isLoggedIn;
    let news;
    let source = 'All';

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

    const showPostSource = source === 'All';
</script>

<!-- prettier-ignore -->
<nav>
    {#if news}
        <span class="read-counter">
            Feed: {source} -- Read: {readNewsCount}/{news.length}
        </span>
    {/if}
    {#if isLoggedIn}
        <button on:click={handleLogoutClick} id="logout">
            <img class="exit-icon" src="icons/door.svg" alt="">
        </button>
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
            <div class="feed">
                <Feed posts={news} 
                    onPostRead={updateReadCount} 
                    {showPostSource}
                ></Feed>
            </div>
        {:else}
            <p class="centered">There's nothing new in your feed! Well done!</p>
        {/if}
    {:else if error}
        <p class="centered" style="color: red;">{error.message}</p>
    {:else}
        <p class="centered">Loading...</p>
    {/if}
    
    <div class="bottom">
        {#if isLoggedIn}
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

</main>
{#if news}
<button class="filter">
    <img class="filter-icon" src="icons/filter.svg" alt="" />
</button>
{/if}

<style>
    :global(body) {
        padding-top: 42px;
    }
    nav {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;

        background-color: #68a5eb;
        height: 42px;

        position: fixed;
        top: 0;
        left: 0;
        right: 0;

        z-index: 1;
    }
    .read-counter {
        margin-left: 24px;
        margin-right: auto;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #fff;
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
    #logout {
        margin: 0;
        margin-right: 8px;
        font-size: 12px;
        height: 80%;
    }
    .exit-icon {
        height: 100%;
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
    .filter {
        position: fixed;
        bottom: 25px;
        right: 25px;

        width: 64px;
        height: 64px;
        border-radius: 50%;
        padding: 1em;
        box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.3);
    }
    .filter-icon {
        width: 100%;
    }
    .credits {
        margin-bottom: 8px;
        font-size: 0.8em;
    }
</style>
