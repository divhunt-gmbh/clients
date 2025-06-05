// © 2025 Divhunt GmbH — Licensed under the Divhunt Framework License. See LICENSE for terms.

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import clientsGRPC from '#clients/grpc/addon.js';

clientsGRPC.Fn('item.connect', async function(item)
{
    const attempt = async () =>
    {
        try
        {
            if(item.Get('instance'))
            {
                throw new Error('Client already connected.');
            }

            const grpcModule = await import('@grpc/grpc-js');
            const protoLoaderModule = await import('@grpc/proto-loader');

            const grpc = grpcModule.default || grpcModule;
            const protoLoader = protoLoaderModule.default || protoLoaderModule;

            const protoPath = join(dirname(fileURLToPath(import.meta.url)), '/../../service.proto');

            const definition = protoLoader.loadSync(protoPath, 
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true
            });

            const universalPackage = grpc.loadPackageDefinition(definition).universal;
            
            const client = new universalPackage.UniversalService(item.Get('host') + ':' + item.Get('port'), grpc.credentials.createInsecure(), 
            {
                'grpc.max_send_message_length': 1024 * 1024 * 100,
                'grpc.max_receive_message_length': 1024 * 1024 * 100,
                'grpc.keepalive_time_ms': 30000,
                'grpc.keepalive_timeout_ms': 10000,
                'grpc.keepalive_permit_without_calls': 1,
                'grpc.http2.min_time_between_pings_ms': 10000,
                'grpc.http2.max_pings_without_data': 0,
                'grpc.dns_resolver': 'native', 
                'grpc.socket_factory': { family: 4 } 
            });

            await new Promise((resolve, reject) => 
            {
                client.waitForReady(new Date(Date.now() + 1500), (error) => 
                {
                    if(error) 
                    {
                        reject(new Error(error));
                    } 
                    else 
                    {
                        resolve();
                    }
                });
            });

            item.Set('instance', client);
            item.Set('retryCount', 0);
            item.Get('onConnect') && item.Get('onConnect').call(item, client);
        }
        catch(error)
        {
            item.Get('onError') && item.Get('onError').call(item, error.message);
            item.Fn('attempt', attempt);
        }
    };

    await attempt();
});