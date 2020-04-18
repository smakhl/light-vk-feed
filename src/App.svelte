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
    let newsBySources;

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
            error = JSON.stringify(e);
        }
    })();

    async function handleLogoutClick() {
        await logout();
        isLoggedIn = false;
        news = undefined;
    }

    async function handleLoginClick() {
        try {
            isLoggedIn = await login();
            if (isLoggedIn) {
                news = await getNews();
            }
        } catch (e) {
            error = JSON.stringify(e);
        }
    }
</script>

<!-- prettier-ignore -->
<div>
    <nav>
        {#if isLoggedIn}
            <button on:click={handleLogoutClick} id="logout">Logout</button>
        {/if}
    </nav>
    {#if isLoggedIn === false}
        <p class="login-wrapper">
            <button on:click={handleLoginClick} id="login">Log in VK</button>
        </p>
    {:else if news}
        <!-- {#each Object.keys(newsBySources) as source, i}
            <details>
                <summary>{source} ({newsBySources[source].length})</summary>
                <Feed news={newsBySources[source]}></Feed>
            </details>
        {/each} -->
        <Feed {news}></Feed>
    {:else if error}
        <p style="color: red;">{error.message}</p>
    {:else}
        <p>...loading</p>
    {/if}
</div>

<style>
    nav {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;

        background-color: #68a5eb;
        height: 42px;
    }

    #logout {
        margin: 5px;
        font-size: 12px;
    }
    .login-wrapper {
        text-align: center;
    }
</style>
