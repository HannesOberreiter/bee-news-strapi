module.exports = {
  routes: [
    {
     method: 'PATCH',
     path: '/rss/:diff',
     handler: 'rss.index',
     config: {
        //auth: false,
      },
    },
  ],
};

