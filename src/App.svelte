<script>
    import Feed from './components/Feed.svelte';
    import Credits from './components/Credits.svelte';
    import Navbar from './components/Navbar.svelte';
    import Filter from './components/Filter.svelte';
    import { getNews } from './vk/data/news';
    import { groupBy } from './utils/groupBy';
    import { auth, AUTH_STATUS } from './stores/auth';

    let source = 'All';
    let newsBySource;
    $: news = newsBySource && newsBySource[source];
    $: readNewsCount = news && news.filter((n) => n.seen).length;
    $: showPostSource = source === 'All';
    $: totalNewsCount = news && news.length;

    auth.subscribe((status) => {
        if (status === AUTH_STATUS.LOGGED_IN) {
            getNews().then((n) => {
                newsBySource = n;
            });
        }
        if (status === AUTH_STATUS.LOGGED_OUT) {
            newsBySource = undefined;
        }
    });

    function handleLoginClick() {
        auth.login();
    }

    function updateReadCount() {
        newsBySource = newsBySource;
    }

    function markAllAsReadAndRefresh() {
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

    function handleSourceChange(newSource) {
        if (newSource === source) return;
        source = newSource;
    }
</script>

<Navbar {source} totalCount="{totalNewsCount}" readCount="{readNewsCount}" />
<!-- prettier-ignore -->
<main>
    <div class="top">
        {#if $auth === AUTH_STATUS.LOGGED_OUT}
            <p class="centered">
                <button on:click={handleLoginClick}>Log in with VK</button>
            </p>
        {:else if $auth === AUTH_STATUS.LOGGED_IN}
            {#if news}
                {#if news.length > 0}
                    <Feed posts={news} 
                        onPostRead={updateReadCount} 
                        {showPostSource}
                    ></Feed>
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
        {#if $auth === AUTH_STATUS.LOGGED_IN && news}
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
