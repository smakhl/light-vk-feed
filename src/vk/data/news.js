import { Post } from '../../viewmodels/Post';
import { groupBy } from '../../utils/groupBy';

// https://vk.com/dev/newsfeed.get
export function getNews() {
    return new Promise((resolve, reject) => {
        VK.Api.call(
            'newsfeed.get',
            {
                v: '5.73',
                return_banned: 0,
                count: 100,
                filters: 'post',
                source_ids: 'groups,pages',
                // start_from: '100/5_-36250705_27295:1163101250',
            },
            function ({ response }) {
                console.log('getNews -> response', response);
                if (!response) {
                    reject(new Error('Failed to load posts'));
                    return;
                }

                const sourcesNames = getSourcesNames(response.groups);
                const unseenPosts = response.items
                    .filter((item) => !Post.hasPostBeenSeen(item))
                    .map((item) => new Post(item, sourcesNames));

                resolve({
                    All: unseenPosts,
                    ...groupBy(unseenPosts, 'sourceName'),
                });
            }
        );
    });
}

function getSourcesNames(groups) {
    const groupsHash = {};
    groups.forEach((gr) => {
        groupsHash[gr.id] = gr.name;
    });
    return groupsHash;
}
