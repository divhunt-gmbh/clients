import clients from '#clients/addon.js';

clients.Fn('item.http.put', function(item, path, data = {}, requestTimeout)
{
    return item.Fn('http.request', path, 'PUT', data, requestTimeout);
});
