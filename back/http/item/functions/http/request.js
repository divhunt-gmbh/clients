// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import clients from '#clients/addon.js';

clients.Fn('item.http.request', function(item, path, method = 'GET', data = {}, requestTimeout)
{
    const instance = item.Get('instance');
    
    if(!instance || !instance.request)
    {
        throw new Error('HTTP Client not initialized properly.');
    }
    
    return instance.request(path, method, data, requestTimeout || item.Get('timeout'));
});