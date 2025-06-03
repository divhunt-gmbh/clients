import clients from '#clients/addon.js';

clients.ItemOn('add', function(item)
{
    switch(item.Get('type').toLowerCase())
    {
        case 'http':
            item.Fn('http.create');
            break;
        case 'grpc':
            item.Fn('gRPC.create');
            break;
        default:
            item.Get('onError') && item.Get('onError')('Client type does not exist.');
    }
});