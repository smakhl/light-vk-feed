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
                // start_from: '100/5_-30666517_1662753:1450415924',
            },
            function ({ response }) {
                if (!response) {
                    reject(new Error('Failed to load posts'));
                    return;
                }

                const sourcesNames = getSourcesNames(response.groups);

                response.items.forEach((item) => {
                    item.source_name = sourcesNames[-item.source_id];

                    const [repost] = item.copy_history || [];
                    if (repost) {
                        repost.source_name = sourcesNames[-repost.from_id];
                    }

                    item.post_uid = `${item.source_id}_${item.post_id}`;
                });

                resolve(response.items);
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
