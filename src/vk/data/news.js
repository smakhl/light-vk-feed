// https://vk.com/dev/newsfeed.get
export function getNews() {
    return new Promise((resolve, reject) => {
        VK.Api.call(
            'newsfeed.get',
            {
                v: '5.73',
                return_banned: 0,
                count: 10,
                filters: 'post'
                // start_from: '100/5_-30666517_1662753:1450415924',
            },
            function ({ response }) {
                console.log('getNews -> response', response);
                if (!response) {
                    reject();
                }

                const groupNames = getGroupNames(response.groups);
                const profilesNames = getProfileNames(response.profiles);

                const result = response.items.map((item) => {
                    const { text, source_id } = item;

                    return {
                        source:
                            groupNames[-source_id] || profilesNames[source_id],
                        text,
                        item,
                    };
                });

                resolve(result);
            }
        );
    });
}

function getProfileNames(profiles) {
    const profilesHash = {};
    profiles.forEach((pr) => {
        profilesHash[pr.id] = `${pr.first_name} ${pr.last_name}`.trim();
    });
    return profilesHash;
}

function getGroupNames(groups) {
    const groupsHash = {};
    groups.forEach((gr) => {
        groupsHash[gr.id] = gr.name;
    });
    return groupsHash;
}
