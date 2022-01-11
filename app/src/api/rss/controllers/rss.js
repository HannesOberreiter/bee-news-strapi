module.exports = ({ strapi }) => ({
  async index(ctx, next) {
    //strapi.log.debug(JSON.stringify(ctx));
    const { diff } = ctx.params;
    const result = await strapi.service('api::rss.rss').main(diff);
    ctx.body = result; 
  },
});