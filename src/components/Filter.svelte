<script>
    import { fly } from 'svelte/transition';
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

        if (!showButton) {
            // prevents scroll
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }

    let selected = $news.feedName;
    function handleFeedChange() {
        news.setFeed(selected);
        toggleShowButton();
    }

    function getUnseenCount(source) {
        return $news.feeds[source].filter((post) => !post.seen).length;
    }
    function getUnseen(newsSource) {
        const feeds = Object.keys(newsSource.feeds);
        return feeds
            .map((name) => {
                return { name, unseen: getUnseenCount(name) };
            })
            .filter((f) => f.unseen > 0);
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
    <div class="feeds">
        {#each getUnseen($news) as feed}
        <label class="feed">
            <input
                type="radio"
                bind:group="{selected}"
                value="{feed.name}"
                on:change="{handleFeedChange}"
            />
            {feed.name} ({feed.unseen})
        </label>
        {:else} There's no unseen posts! {/each}
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
        max-height: 60%;

        display: flex;
        flex-direction: column;
        z-index: 1;
    }
    .refresh {
        width: 100%;
    }
    .shadow {
        box-shadow: 0px 0px 5px 1px rgba(0, 0, 0, 0.3);
    }
    .close {
        margin-top: auto;
    }
    .feeds {
        margin-bottom: 1em;
        overflow: auto;
    }
    .feed {
        text-align: center;
        padding: 5px;
        border: 1px solid rgb(128, 128, 128);
        margin: 5px 0;
        border-radius: 5px;
    }
    .feed:hover {
        background-color: rgb(240, 240, 240);
    }
</style>
