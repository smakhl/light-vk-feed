<script>
    import { login, logout, getIsLoggedIn } from './vk/auth';
    import Feed from './components/Feed.svelte';
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
    <Feed {news}></Feed>
{:else if error}
    <p style="color: red;">{error.message}</p>
{:else}
    <p>...loading</p>
{/if}

<style>
    nav {
        display: flex;
        flex-direction: row;
        justify-content: flex-end;
        align-items: center;

        background-color: #4a76a8;
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
