// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import clientsGRPC from '#clients/grpc/addon.js';

clientsGRPC.Fn('item.attempt', function(item, callback)
{
    const retryCount = item.Get('retryCount') + 1;
    const maxRetries = item.Get('maxRetries');
    
    item.Set('retryCount', retryCount);
    
    if(retryCount >= maxRetries)
    {
        item.Get('onRetry') && item.Get('onRetry').call(item, retryCount, true);
        return;
    }
    
    item.Get('onRetry') && item.Get('onRetry').call(item, retryCount, false);
    
    setTimeout(() => 
    {
        callback();
    }, 10000);
});