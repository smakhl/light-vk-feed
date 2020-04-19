<script>
    import Feed from './components/Feed.svelte';
    import { login, logout, getIsLoggedIn } from './vk/auth';
    import { getNews } from './vk/data/news';
    import { groupBy } from './utils/groupBy';
    import { makeDateFromUnixTime } from './utils/makeDateFromUnixTime';
    import { hasPostBeenSeen } from './storage';

    let error;
    let isLoggedIn;
    let news;
    // let newsBySources;

    (async () => {
        try {
            isLoggedIn = await getIsLoggedIn();
            if (isLoggedIn) {
                const _news = await getNews();
                news = _news.filter((n) => !hasPostBeenSeen(n.post_uid));
                // const lastPost = news[news.length - 1];
                // console.log('lastPost', lastPost);
                // const lastPostDate = makeDateFromUnixTime(lastPost.date);
                // console.log(lastPostDate);
                // newsBySources = groupBy(news, 'source_name');
                // console.log(newsBySources);
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
    function handlePostRead() {
        readNewsCount = news.filter((n) => n.seen).length;
    }
</script>

<!-- prettier-ignore -->
<div>
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
    <main>
        {#if isLoggedIn === false}
            <p class="centered">
                <button on:click={handleLoginClick} id="login">Log in VK</button>
            </p>
        {:else if news}
            <!-- {#each Object.keys(newsBySources) as source, i}
                <details>
                    <summary>{source} ({newsBySources[source].length})</summary>
                    <Feed news={newsBySources[source]}></Feed>
                </details>
            {/each} -->
            <Feed {news} onPostRead={handlePostRead}></Feed>
        {:else if error}
            <p class="centered" style="color: red;">{error.message}</p>
        {:else}
            <p class="centered">...loading</p>
        {/if}
    </main>
</div>

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
        margin-top: 42px;
        padding: 8px;
    }
    #logout {
        margin: 0;
        margin-right: 8px;
        font-size: 12px;
    }
    .centered {
        text-align: center;
    }
</style>
