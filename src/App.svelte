<script>
    import Feed from './components/Feed.svelte';
    import Credits from './components/Credits.svelte';
    import Navbar from './components/Navbar.svelte';
    import Filter from './components/Filter.svelte';
    import { login, logout, getIsLoggedIn } from './vk/auth';
    import { getNews } from './vk/data/news';
    import { groupBy } from './utils/groupBy';

    let error;
    let isLoggedIn;
    let source = 'All';
    let newsBySource;
    $: news = newsBySource && newsBySource[source];

    (async () => {
        try {
            isLoggedIn = await getIsLoggedIn();
            if (isLoggedIn) {
                newsBySource = await getNews();
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
                newsBySource = await getNews();
            }
        } catch (e) {
            error = e;
        }
    }

    $: readNewsCount = news && news.filter((n) => n.seen).length;
    function updateReadCount() {
        newsBySource = newsBySource;
    }

    async function markAllAsReadAndRefresh() {
        news.forEach((n) => {
            n.markSeen();
        });
        refresh();
    }

    async function refresh() {
        window.scrollTo(0, 0);
        newsBySource = await getNews();
        if (!newsBySource[source]) {
            source = 'All';
        }
        updateReadCount();
    }

    $: showPostSource = source === 'All';
    $: totalNewsCount = news && news.length;

    function handleSourceChange(newSource) {
        if (newSource === source) return;

        source = newSource;
        news = newsBySource[source];
    }
</script>

<Navbar
    {source}
    totalCount="{totalNewsCount}"
    readCount="{readNewsCount}"
    shouldShowLogoutBtn="{isLoggedIn}"
    {handleLogoutClick}
/>
<!-- prettier-ignore -->
<main>
    {#if isLoggedIn === false}
        <p class="centered">
            <button on:click={handleLoginClick}>Log in with VK</button>
        </p>
    {:else if news}
        {#if news.length > 0}
            <div class="top">
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
        {#if isLoggedIn && news}
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

    {#if newsBySource && newsBySource.All.length}
        <Filter
            {newsBySource}
            current="{source}"
            onCurrentChanged="{handleSourceChange}"
        />
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
