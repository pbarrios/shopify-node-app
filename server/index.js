require('isomorphic-fetch');
require('dotenv').config();

const fs = require('fs');
const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('../config/webpack.config.js');

const ShopifyAPIClient = require('shopify-api-node');
const ShopifyExpress = require('@shopify/shopify-express');
const {RedisStrategy} = require('@shopify/shopify-express/strategies');

const RedisClient = require('./modules/redis-client');
const DopplerClient = require('./modules/doppler-client');

const {
  SHOPIFY_APP_KEY,
  SHOPIFY_APP_HOST,
  SHOPIFY_APP_SECRET,
  NODE_ENV,
  REDIS_HOST,
  REDIS_PASSWORD,
  REDIS_PORT
} = process.env;

const redisConfig = {
  host: REDIS_HOST,
  port: parseInt(REDIS_PORT),
  password: REDIS_PASSWORD
};

const shopifyConfig = {
  host: SHOPIFY_APP_HOST,
  apiKey: SHOPIFY_APP_KEY,
  secret: SHOPIFY_APP_SECRET,
  scope: ['read_customers', 'write_customers'],
  shopStore: new RedisStrategy(redisConfig),
  afterAuth(request, response) {
    const { session: { accessToken, shop } } = request;

    const redisClient = new RedisClient(redisConfig);
    redisClient.saveShop(shop, {accessToken});
 
    registerWebhook(shop, accessToken, {
      topic: 'app/uninstalled',
      address: `${SHOPIFY_APP_HOST}/app/uninstalled`,
      format: 'json'
    });

    return response.redirect('/');
  },
};

const registerWebhook = function(shopDomain, accessToken, webhook) {
  const shopify = new ShopifyAPIClient({ shopName: shopDomain, accessToken: accessToken });
  shopify.webhook.create(webhook).then(
    response => console.log(`webhook '${webhook.topic}' created`),
    err => console.log(`Error creating webhook '${webhook.topic}'. ${JSON.stringify(err.response.body)}`)
  );
}

const app = express();
const isDevelopment = NODE_ENV !== 'production';

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(
  session({
    store: new RedisStore(redisConfig),
    secret: SHOPIFY_APP_SECRET,
    resave: true,
    saveUninitialized: false
  })
);

// Run webpack hot reloading in dev
if (isDevelopment) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    hot: true,
    inline: true,
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false,
    },
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
} else {
  const staticPath = path.resolve(__dirname, '../assets');
  app.use('/assets', express.static(staticPath));
}

// Install
app.get('/install', (req, res) => res.render('install'));

// Create shopify middlewares and router
const shopify = ShopifyExpress(shopifyConfig);

 // Mount Shopify Routes
 const {routes, middleware} = shopify;
 const {withShop, withWebhook} = middleware;

app.use('/shopify', routes);

// Client
app.get('/', withShop({authBaseUrl: '/shopify'}), function(request, response) {
  const { session: { shop, accessToken } } = request;
  
  const redisClient = new RedisClient(redisConfig);
  redisClient.getShop(shop, obj => {
    
    // TODO: this should do it the wihtShop middleware, but since the cookie is not removed it passes the authentication process.
    if (obj === null) {
      response.redirect(`/shopify/auth?shop=${shop}`);
      return;
    }

    response.render('app', {
      title: 'Doppler for Shopify',
      apiKey: shopifyConfig.apiKey,
      shop: shop,
      dopplerAccountName: obj && obj.dopplerAccountName ? obj.dopplerAccountName : '',
      dopplerListId: obj && obj.listId ? obj.listId : 0,
      dopplerImportCompleted: obj && obj.dopplerImportCompleted ? obj.dopplerImportCompleted : false
    });
  })
});

app.get('/doppler-lists', withShop({authBaseUrl: '/shopify'}), function(request, response) {
  const { session: { shop, accessToken } } = request;
  
  const redisClient = new RedisClient(redisConfig);
  redisClient.getShop(shop, obj => {
    
    const doppler = new DopplerClient(obj.dopplerAccountName, obj.dopplerApiKey, shop)

    doppler.getLists()
      .then(lists => response.json(lists));
  })
});

app.post('/sync-to-list', withShop({authBaseUrl: '/shopify'}), bodyParser.json(), function(request, response) {
  const { session: { shop, accessToken }, body: { listId } } = request;
  
  registerWebhook(shop, accessToken, {
    topic: 'customers/create',
    address: `${SHOPIFY_APP_HOST}/customers/create`,
    format: 'json'
  });

  var redisClient = new RedisClient(redisConfig);
  redisClient.getShop(shop, obj => {
    const shopify = new ShopifyAPIClient({ shopName: shop, accessToken: accessToken });
    shopify.customer
      .list()
      .then(customers => {
        const doppler = new DopplerClient(obj.dopplerAccountName, obj.dopplerApiKey, shop)
        
        doppler.importSubscribers(customers, listId)
          .then(taskId => {

            redisClient.saveShop(shop, {
              listId,
              taskId              
            });
            
            response.send({success: true});

          }).catch(error => console.debug(error));
      });
  });
});

app.post('/doppler-import-completed', function (request, response) {
  const shop = request.query.shop;
  var redisClient = new RedisClient(redisConfig);
  redisClient.saveShop(shop, {dopplerImportCompleted: true}, () => {
    response.send('thank you!')
  });
});

app.get('/import-task-details', withShop({authBaseUrl: '/shopify'}), function(request, response) {
  const { session: { shop } } = request;
  var redisClient = new RedisClient(redisConfig);
  
  redisClient.getShop(shop, obj => {
    const doppler = new DopplerClient(obj.dopplerAccountName, obj.dopplerApiKey, shop)
    doppler.getImportTask(obj.taskId)
      .then(json => {
        response.send(json.importDetails);
      }).catch(err => console.error(err));
  });
});


app.post('/connect-to-doppler', withShop({authBaseUrl: '/shopify'}), bodyParser.json(), function(request, response) {
  const { session: { shop, accessToken }, body: { dopplerAccountName, dopplerApiKey } } = request;

  const redisClient = new RedisClient(redisConfig);

  redisClient.getShop(shop, (obj) => {
    if (obj == null) throw new Error(`The shop ${shop} is not authorized`);
    
    const doppler = new DopplerClient(dopplerAccountName, dopplerApiKey, shop);
    doppler.AreCredentialsValid()
    .then(val => {
      if (val) {
        redisClient.saveShop(shop, { dopplerAccountName, dopplerApiKey });
        response.send({success: true});
      }
      else 
        response.send({success: false, body: 'Invalid credentials'});
    }).catch(error => {
      console.error(error.message);
      response.send({success: false});
    });
  });
});

app.post('/customers/create', withWebhook((error, request) => {
  if (error) {
    console.error(error);
    return;
  }

  const redisClient = new RedisClient(redisConfig);
  const shopDomain = request.get('X-Shopify-Shop-Domain');
  
  redisClient.getShop(shopDomain, obj => {
    if (obj !== null && obj.listId !== null) {

      const doppler = new DopplerClient(obj.dopplerAccountName, obj.dopplerApiKey, shopDomain);
      const customer = JSON.parse(request.body);

      doppler.createSubscriber(customer, obj.listId)
        .then(response => {console.log(`Added subscriber ${customer.email}to Doppler list ${obj.listId}`)})
        .catch(error => console.debug(error));
      }
  });
}));

app.post('/app/uninstalled', withWebhook((error, request) => {
  if (error) {
    console.error(error);
    return;
  }

  const jsonPayload = JSON.parse(request.body);
  const redisClient = new RedisClient(redisConfig);
  redisClient.removeShop(jsonPayload.domain);
  console.log(`app for shop ${jsonPayload.domain} uninstalled`);
}));

// Error Handlers
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(error, request, response, next) {
  response.locals.message = error.message;
  response.locals.error = request.app.get('env') === 'development' ? error : {};

  response.status(error.status || 500);
  response.render('error');
});

module.exports = app;
