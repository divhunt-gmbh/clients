// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import divhunt from '#framework/load.js';

const clientsGRPC = divhunt.Addon('clients.grpc', (addon) =>
{
    addon.Field('id', ['string|number']);
    addon.Field('instance', ['object']);
    addon.Field('host', ['string', 'localhost']);
    addon.Field('port', ['number', 50000]);
    addon.Field('timeout', ['number', 5]);
    addon.Field('metadata', ['object', {}]);
    
    addon.Field('onError', ['function']);
    addon.Field('onConnect', ['function']);

    addon.Field('onStream', ['function']);
    addon.Field('onStreamError', ['function']);
    addon.Field('onStreamEnd', ['function']);
    addon.Field('onStreamData', ['function']);
    addon.Field('onStreamRequest', ['function']);
    addon.Field('onStreamRespond', ['function']);
});

export default clientsGRPC;