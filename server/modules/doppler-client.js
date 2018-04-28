const querystring = require('querystring');
const fetch = require('node-fetch');

module.exports = class Doppler {
    constructor(accountName, apiKey, shop) {
        this.accountName = accountName;
        this.apiKey = apiKey;
        this.shop = shop;
    }

    async AreCredentialsValid() {
        const accountName = querystring.escape(this.accountName);
        const apiKey = querystring.escape(this.apiKey);

        const url = `https://restapi.fromdoppler.com/accounts/${accountName}?api_key=${apiKey}`;
        
        const response = await fetch(url);
        
        return response.status === 200;
    }

    async getLists() {
        const accountName = querystring.escape(this.accountName);
        const apiKey = querystring.escape(this.apiKey);
        
        const url = `https://restapi.fromdoppler.com/accounts/${accountName}/lists?page=1&per_page=200&state=active&api_key=${apiKey}`;

        const response = await fetch(url);
        const json = await response.json();

        return json.items.map(list => { return { listId: list.listId, name: list.name } });
    }

    async importSubscribers(customers, listId) {
        const accountName = querystring.escape(this.accountName);
        const apiKey = querystring.escape(this.apiKey);
        const shop = querystring.escape(this.shop);
        const { SHOPIFY_APP_HOST } = process.env;

        const subscribers = {
            items: customers.map(customer => { 
                return { 
                    email: customer.email,
                    fields: [
                        {
                            name : 'FIRSTNAME',
                            value: customer.first_name,
                            predefined: true,
                            type: 'string'
                        },
                        {
                            name : 'LASTNAME',
                            value: customer.last_name,
                            predefined: true,
                            type: 'string'
                        }]
                }
            }),
            fields: ['FIRSTNAME','LASTNAME'],
            callback: `${SHOPIFY_APP_HOST}/doppler-import-completed?shop=${shop}`
        };

        const url = `https://restapi.fromdoppler.com/accounts/${accountName}/lists/${listId}/subscribers/import?api_key=${apiKey}`;

        const response = await fetch(url, { method:'POST', body: JSON.stringify(subscribers) });
        const json = await response.json();

        return json.createdResourceId;
    }

    async createSubscriber(customer, listId) {
        const accountName = querystring.escape(this.accountName);
        const apiKey = querystring.escape(this.apiKey);

        const url = `https://restapi.fromdoppler.com/accounts/${accountName}/lists/${listId}/subscribers?api_key=${apiKey}`;

        const response = await fetch(url, { method:'POST', body: JSON.stringify({ 
            email: customer.email,
            fields: [
                {
                    name : 'FIRSTNAME',
                    value: customer.first_name,
                    predefined: true,
                    type: 'string'
                },
                {
                    name : 'LASTNAME',
                    value: customer.last_name,
                    predefined: true,
                    type: 'string'
                }]
        }) });
        const json = await response.json();

        return json;
    }

    async getImportTask(taskId) {
        const accountName = querystring.escape(this.accountName);
        const apiKey = querystring.escape(this.apiKey);
        
        const url = `https://restapi.fromdoppler.com/accounts/${accountName}/tasks/${taskId}?api_key=${apiKey}`;

        const response = await fetch(url);
        const json = await response.json();

        return json;
    }
}