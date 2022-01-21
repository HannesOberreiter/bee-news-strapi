'use strict';

module.exports = {
    // https://dev.to/strapi/how-to-build-a-news-aggregator-app-using-strapi-and-nuxtjs-23hj
    '* * */1 * *': {
        task: async ({ strapi }) => {
            //await strapi.config.rss.updateFeed();
            console.log("I am running every 10 seconds >> " + new Date());
            //const res = await strapi.service('api::rss.rss').main(2);
            return true;
        },
        options: {
            // List of valid timezones: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List
            //tz: 'Europe/Vienna',
        },
    },
};
 