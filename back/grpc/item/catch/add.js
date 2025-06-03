import clientsGRPC from '#clients/grpc/addon.js';

clientsGRPC.ItemOn('add', function(item)
{
    item.Fn('connect');
});