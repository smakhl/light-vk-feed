<script>
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { news, NEWS_STATUS } from '../stores/news';

    const flyProps = {
        y: 1000,
        opacity: 0.5,
        easing: quintOut,
    };

    let showButton = true;
    function toggleShowButton() {
        showButton = !showButton;
    }

    let selected = $news.feedName;
    function handleFeedChange() {
        news.setFeed(selected);
        toggleShowButton();
    }

    function getUnseenCount(source) {
        if (!$news.feeds[source]) return undefined;
        return $news.feeds[source].filter((post) => !post.seen).length;
    }
</script>

{#if showButton}
<button
    on:click="{toggleShowButton}"
    class="filter-btn shadow"
    transition:fly="{flyProps}"
>
    <img class="filter-icon" src="icons/filter.svg" alt="" />
</button>
{:else}
<div class="paranja" on:click="{toggleShowButton}"></div>
<div class="popup shadow" transition:fly="{flyProps}">
    <div class="sources">
        {#each Object.keys($news.feeds) as feedName} {#if
        getUnseenCount(feedName) > 0}
        <label>
            <input
                type="radio"
                bind:group="{selected}"
                value="{feedName}"
                on:change="{handleFeedChange}"
            />
            {feedName} ({getUnseenCount(feedName)})
        </label>
        {/if} {/each}
    </div>
    <button on:click="{toggleShowButton}" class="close">Close</button>
</div>
{/if}
<style>
    .filter-btn {
        position: fixed;
        bottom: 25px;
        right: 25px;

        width: 64px;
        height: 64px;
        margin: 0;
        border-radius: 50%;
        padding: 1em;
    }
    .filter-icon {
        width: 100%;
    }
    .paranja {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }
    .popup {
        padding: 1em;
        position: fixed;
        bottom: 1%;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        width: 400px;
        max-width: 80%;

        display: flex;
        flex-direction: column;
        z-index: 1;
    }
    .shadow {
        box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.3);
    }
    .close {
        margin-top: auto;
    }
    .sources {
        margin-bottom: 1em;
    }
</style>
