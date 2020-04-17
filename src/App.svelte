<script>
    import { login, logout, getIsLoggedIn } from './vk/auth';
    import Feed from './components/Feed.svelte';

    let isLoggedIn;
    let waitIsLoggedIn = (async () => {
        isLoggedIn = await getIsLoggedIn();
    })();

    function handleLogoutClick() {
        logout().then(() => {
            isLoggedIn = false;
        });
    }

    function handleLoginClick() {
        login().then((isSuccessful) => {
            isLoggedIn = isSuccessful;
        });
    }
</script>

<!-- prettier-ignore -->
<div>
    <nav>
        {#if isLoggedIn}
            <button on:click={handleLogoutClick} id="logout">Logout</button>
        {/if}
    </nav>
    {#await waitIsLoggedIn}
        <p>...loading</p>
    {:then}
        {#if isLoggedIn}
            <Feed></Feed>
        {:else}
            <p class="login-wrapper">
                <button on:click={handleLoginClick} id="login">Log in VK</button>
            </p>
        {/if}
    {:catch error}
        <p style="color: red;">{error.message}</p>
    {/await}
</div>

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
