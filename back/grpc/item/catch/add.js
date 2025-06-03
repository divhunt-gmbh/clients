// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import clientsGRPC from '#clients/grpc/addon.js';

clientsGRPC.ItemOn('add', function(item)
{
    item.Fn('connect');
});