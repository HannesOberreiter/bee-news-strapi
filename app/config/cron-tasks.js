'use strict';

module.exports = {
    // https://dev.to/strapi/how-to-build-a-news-aggregator-app-using-strapi-and-nuxtjs-23hj
    'rss': {
       task: async ({ _strapi }) => { 
           //console.log("I am running every hour >> " + new Date());
           await strapi.service('api::rss.rss').main(10);
           //console.log(res)
           return true;
       },
       options: {
           rule: '0 */1 * * *',
           tz: 'Europe/Vienna',
       },
    }
};

