'use strict';

module.exports = {
    // https://dev.to/strapi/how-to-build-a-news-aggregator-app-using-strapi-and-nuxtjs-23hj
    '0 0 0 * * *': {
        task: async ({ strapi }) => {
            //await strapi.config.rss.updateFeed();
            const res = await strapi.service('api::rss.rss').main(0);
            strapi.log.debug(JSON.stringify(res));
            return true;
        },
        //options: {
            // List of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
        //    tz: 'Europe/Vienna',
        //},
    },
};
 