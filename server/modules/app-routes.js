const express = require('express');
const RedisClient = require('./redis-client');
const DopplerClient = require('./doppler-client');

module.exports = function createRouter(withShop, withWebhook, redisConfig) {
    const router = express.Router();

    router.get('/', withShop({authBaseUrl: '/shopify'}), function(request, response) {
    const { session: { shop, accessToken } } = request;
    
    const redisClient = new RedisClient(redisConfig);
    redisClient.getShop(shop, obj => {
      
      let connectionStatus = 0;
      if (obj.dopplerApiKey != null) connectionStatus = 2;
      if (obj.listId != null) connectionStatus = 3;
  
      response.render('app', {
        title: 'Doppler for Shopify',
        apiKey: shopifyConfig.apiKey,
        shop: shop,
        connectionStatus: connectionStatus
      });
    })
  });
  
  router.get('/doppler-lists', withShop({authBaseUrl: '/shopify'}), function(request, response) {
    const doppler = new DopplerClient('mherrera@makingsense.com', 'E99CAAA13759DB9DDDDC3B9D26C14D5F')
    doppler.getLists()
      .then(lists => response.json(lists));
  });
  
  router.post('/sync-to-list', withShop({authBaseUrl: '/shopify'}), function(request, response) {
     // registerWebhook(shop, accessToken, {
      //   topic: 'orders/create',
      //   address: `${SHOPIFY_APP_HOST}/order-create`,
      //   format: 'json'
      // });
  });
  
  router.post('/connect-to-doppler', withShop({authBaseUrl: '/shopify'}), function(request, response) {
    const { session: { shop, accessToken }, body: { dopplerAccountName, dopplerApiKey } } = request;
  
    const redisClient = new RedisClient(redisConfig);
  
    redisClient.getShop(shop, (obj) => {
      if (obj == null) throw new Error(`The shop ${shop} is not authorized`);
      
      // Check if dopplerApiKey is valid 
      redisClient.saveShop(shop, { dopplerAccountName, dopplerApiKey });
      response.send({success: true});
    });
  });
  
  router.post('/app/uninstalled', withWebhook((error, request) => {
     if (error) {
       console.error(error);
       return;
    }
  
    console.log('We got a webhook!');
    console.log('Details: ', request.webhook);
    console.log('Body:', request.body);
  }));

}  


    