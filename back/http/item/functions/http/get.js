import clients from '#clients/addon.js';

clients.Fn('item.http.get', function(item, path, data = {}, requestTimeout)
{
    return item.Fn('http.request', path, 'GET', data, requestTimeout);
});