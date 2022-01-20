// https://dev.to/strapi/how-to-build-a-news-aggregator-app-using-strapi-and-nuxtjs-23hj
const Parser = require('rss-parser');
const striptags = require('striptags');

function cleanUtm(url){
  // https://stackoverflow.com/a/51187881/5316675
  return url.replace(/(?<=&|\?)utm_.*?(&|$)/igm, "");
}

function stripHtml(value){
  return striptags(value)
}

function diffInDays(date1, date2) {
    const difference = Math.floor(date1) - Math.floor(date2);
    return Math.floor(difference / 60 / 60 / 24);
}

async function checkDuplicates(strapi, item) {
  const count = await strapi.db.query('api::newsitem.newsitem').count({
    where: {
      title: item.title,
      published: new Date(item.pubDate),
      link: cleanUtm(item.link)
    },
  });
  return count;
}

async function getNewFeedItemsFrom(feedId, feedUrl, diff, strapi) {
  let parser = new Parser({
    customFields: {
      item: [
        // updated = WordPress field
        ['updated', "pubDate"],
        // no pubDate in Journal of Apiculture
        ['dc:date', "pubDate"],
        // NZ Forum
        ["content:encodedSnippet", "contentSnippet"],
        ["content:encoded", "content"]
      ],
    }
  });

  try {
    const rss = await parser.parseURL(feedUrl)
    const todaysDate = new Date().getTime() / 1000;

    let items = rss.items.filter((item) => {
      //strapi.log.debug(item.pubDate)
      const blogPublishedDate = new Date(item.pubDate).getTime() / 1000;
      return diffInDays(todaysDate, blogPublishedDate) <= diff;
    });
    //strapi.log.debug(JSON.stringify(items))

    let results = []
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if( await checkDuplicates(strapi, item) == 0  ){
        results.push({...item, feedId: feedId});
      }
    }
  return results;
  } catch(error) {
    strapi.log.warn(error)
  }
  return []
}



async function getFeedUrls(strapi) {
  return await strapi.entityService.findMany('api::feedsource.feedsource', {
    filters: { enabled: true  }
  });
}

async function getNewFeedItems(strapi, diff) {
    let allNewFeedItems = [];

    const feeds = await getFeedUrls(strapi);

    strapi.log.debug(JSON.stringify(feeds));

    for (let i = 0; i < feeds.length; i++) {
        const { id, link } = feeds[i];
        try {
          const feedItems = await getNewFeedItemsFrom(id, link, diff, strapi);
          allNewFeedItems = [...allNewFeedItems, ...feedItems];
        } catch (error) {
          strapi.log.warn(error)
        }
    }

    return allNewFeedItems;
}



module.exports = ({ strapi }) => ({
    async main(diff = 0) {

        const feedItems = await getNewFeedItems(strapi, diff);

        for (let i = 0; i < feedItems.length; i++) {

            const item = feedItems[i];
            //strapi.log.debug(JSON.stringify(item));
            let preview = !item.contentSnippet ? item.content: item.contentSnippet;
            preview = stripHtml(preview)
            const link = cleanUtm(item.link)
            const newsItem = {
                title: item.title,
                preview: preview,
                link: link,
                creator: item.creator || '',
                published: new Date(item.pubDate),
                sponsored: false,
                feedsource: {
                  id: item.feedId,
                },
            };
            try {
              await strapi.entityService.create('api::newsitem.newsitem', {
                data: newsItem,
              });
            } catch (error) {
              strapi.log.error(error)
            }
        }
        return feedItems;
    }
});
 