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
                console.log('getNews -> response', response);
                if (!response) {
                    reject();
                }

                const groupNames = getGroupNames(response.groups);

                response.items.forEach((item) => {
                    item.source_name = groupNames[-item.source_id];
                    const [repost] = item.copy_history || [];
                    if (repost) {
                        repost.source_name = groupNames[-repost.from_id];
                    }
                });

                resolve(response.items);
            }
        );
    });
}

function getGroupNames(groups) {
    const groupsHash = {};
    groups.forEach((gr) => {
        groupsHash[gr.id] = gr.name;
    });
    return groupsHash;
}
