import clientsGRPC from '#clients/grpc/addon.js';

const promises = {};

clientsGRPC.Fn('item.resolve', function(item, id, payload = null) 
{
    if(payload !== null) 
    {
        if(id in promises) 
        {
            promises[id].resolve(payload);
            delete promises[id];
        }
        return;
    }

    setTimeout(() => 
    {
        if(id in promises) 
        {
            promises[id].reject('Request timed out after 5 seconds. No response received.');
            delete(promises[id]);
        }
    }, 5000);

    return new Promise((resolve, reject) => 
    {
        promises[id] = { resolve, reject };
    });
});