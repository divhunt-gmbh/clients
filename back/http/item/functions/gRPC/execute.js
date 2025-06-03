// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import clients from '#clients/addon.js';

clients.Fn('item.grpc.execute', function(item, name, data = {}, requestTimeout)
{
    const instance = item.Get('instance');
    
    if(!instance || !instance.execute)
    {
        throw new Error('gRPC Client not initialized properly.');
    }
    
    return instance.execute(name, data, requestTimeout || item.Get('timeout'));
});