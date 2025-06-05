// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import clientsGRPC from '#clients/grpc/addon.js';
import divhunt from '#framework/load.js';

clientsGRPC.Fn('item.stream', async function(item)
{
    const grpcModule = await import('@grpc/grpc-js');
    const grpc = grpcModule.default || grpcModule;

    const client = item.Get('instance');
    
    if(!client)
    {
        await item.Fn('connect');
    }

    const metadata = new grpc.Metadata();

    Object.entries(item.Get('metadata')).forEach(([key, value]) => 
    {
        metadata.add(key, value);
    });

    const stream = client.Stream(metadata);

    /* Request Method */

    stream.request = function(service, name, data, id = null)
    {
        id = id ? id : divhunt.GenerateUID();

        stream.write({
            data: JSON.stringify({type: 'request', service, name, data, id})
        });

        item.Get('onStreamRequest') && item.Get('onStreamRequest').call(item, stream, {type: 'request', service, name, data, id});

        return item.Fn('resolve', id);
    };

    /* Respond Method */

    stream.respond = function(data, message, code, id = null)
    {
        id = id ? id : divhunt.GenerateUID();

        stream.write({
            data: JSON.stringify({type: 'respond', data, message, code, id})
        });

        item.Get('onStreamRespond') && item.Get('onStreamRespond').call(item, stream, {type: 'respond', data, message, code, id});
    };

    /* Subscribe Method */

    stream.subscribe = function(name)
    {
        
    };

    /* Other */

    item.Get('onStream') && item.Get('onStream').call(item, stream);

    /* Data Event */

    stream.on('data', (response) => 
    {
        const payload = JSON.parse(response.data);

        if(payload.type === 'respond')
        {
            item.Fn('resolve', payload.id, payload);
        }

        item.Get('onStreamData') && item.Get('onStreamData').call(item, stream, payload);
    })

    /* Other Events */

    stream.on('error', (error) => 
    {
        item.Get('onStreamError') && item.Get('onStreamError').call(item, stream, error.message);
    })

    stream.on('end', () => 
    {
        item.Get('onStreamEnd') && item.Get('onStreamEnd').call(item, stream);
        item.Set('instance', null);
        
        item.Fn('attempt', () => 
        {
            item.Fn('stream');
        });
    })

    return stream;
});