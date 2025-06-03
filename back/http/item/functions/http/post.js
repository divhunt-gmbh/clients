import clients from '#clients/addon.js';

clients.Fn('item.http.post', function(item, path, data = {}, requestTimeout)
{
    return item.Fn('http.request', path, 'POST', data, requestTimeout);
});