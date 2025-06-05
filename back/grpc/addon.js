// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import divhunt from '#framework/load.js';

const clientsGRPC = divhunt.Addon('clients.grpc', (addon) =>
{
    addon.Field('id', ['string']);
    addon.Field('instance', ['object']);
    addon.Field('host', ['string', 'localhost']);
    addon.Field('port', ['number', 50000]);
    addon.Field('timeout', ['number', 15]);
    addon.Field('metadata', ['object', {}]);
    addon.Field('retryCount', ['number', 0]);
    addon.Field('maxRetries', ['number', 10]);
    addon.Field('connecting', ['boolean', false]);
    addon.Field('streaming', ['boolean', false]);
    
    addon.Field('onError', ['function']);
    addon.Field('onConnect', ['function']);
    addon.Field('onRetry', ['function']);

    addon.Field('onStream', ['function']);
    addon.Field('onStreamError', ['function']);
    addon.Field('onStreamEnd', ['function']);
    addon.Field('onStreamData', ['function']);
    addon.Field('onStreamRequest', ['function']);
    addon.Field('onStreamRespond', ['function']);
});

export default clientsGRPC;