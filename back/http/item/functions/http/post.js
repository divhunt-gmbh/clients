// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import clients from '#clients/addon.js';

clients.Fn('item.http.post', function(item, path, data = {}, requestTimeout)
{
    return item.Fn('http.request', path, 'POST', data, requestTimeout);
});