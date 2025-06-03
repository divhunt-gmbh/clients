// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import divhunt from '#framework/load.js';

const clients = divhunt.Addon('clients', (addon) =>
{
    addon.Field('id', ['string']);
    addon.Field('instance', ['object']);
    addon.Field('type', ['string', 'http']);
    addon.Field('host', ['string', 'localhost']);
    addon.Field('port', ['number', 3000]);
    addon.Field('timeout', ['number', 15]);
    
    addon.Field('onConnect', ['function']);
    addon.Field('onRequest', ['function']);
    addon.Field('onResponse', ['function']);
    addon.Field('onError', ['function']);
    addon.Field('onComplete', ['function']);
});

export default clients;