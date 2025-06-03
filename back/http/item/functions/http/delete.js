import clients from '#clients/addon.js';

clients.Fn('item.http.delete', function(item, path, data = {}, requestTimeout)
{
    return item.Fn('http.request', path, 'DELETE', data, requestTimeout);
});