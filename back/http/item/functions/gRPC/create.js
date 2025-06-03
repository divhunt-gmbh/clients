import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

import divhunt from '#framework/load.js';
import clients from '#clients/addon.js';

clients.Fn('item.grpc.create', function(item)
{
    const { host, port, timeout } = item.Get(['host', 'port', 'timeout']);
    
    if(item.Get('instance'))
    {
        item.Get('onError') && item.Get('onError')('gRPC Client already created.');
        return;
    }
    
    this.methods.init = () =>
    {
        const protoPath = join(dirname(fileURLToPath(import.meta.url)), '/../../../service.proto');
        
        const definition = protoLoader.loadSync(protoPath, 
        {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });

        const universalPackage = grpc.loadPackageDefinition(definition).universal;
        
        const address = `${host}:${port}`;
        
        const client = new universalPackage.UniversalService(address, grpc.credentials.createInsecure(), 
        {
            'grpc.max_send_message_length': 1024 * 1024 * 100,
            'grpc.max_receive_message_length': 1024 * 1024 * 100,
            'grpc.keepalive_time_ms': 30000,
            'grpc.keepalive_timeout_ms': 10000,
            'grpc.keepalive_permit_without_calls': 1,
            'grpc.http2.min_time_between_pings_ms': 10000,
            'grpc.http2.max_pings_without_data': 0
        });
        
        const wrapper = {
            instance: client,
            execute: this.methods.execute,
            ping: this.methods.ping
        };
        
        item.Set('instance', wrapper);
        
        if(item.Get('onConnect'))
        {
            item.Get('onConnect')(wrapper);
        }
        
        divhunt.Emit('clients.grpc.connect', wrapper);
    };
    
    this.methods.execute = async (functionName, data = {}, requestTimeout = timeout) =>
    {
        const client = item.Get('instance');
        
        if(!client)
        {
            throw new Error('gRPC Client not initialized.');
        }
        
        const grpc = {
            id: item.Get('id'),
            client,
            function: functionName,
            data,
            items: {},
            variables: {},
            duration: performance.now(),
            response: {
                data: null,
                message: 'Request not sent.',
                code: 0
            }
        };
        
        try
        {
            divhunt.Emit('clients.grpc.request.before', grpc);
            await divhunt.Middleware('clients.grpc.request.before', grpc);
            
            if(item.Get('onRequest'))
            {
                await Promise.resolve(item.Get('onRequest')(grpc));
            }
            
            const response = await new Promise((resolve, reject) => 
            {
                const deadline = new Date(Date.now() + requestTimeout * 1000);
                
                try
                {
                    client.instance.execute({function: functionName, data: JSON.stringify(grpc.data)}, {deadline}, (error, response) => 
                    {
                        if(error) 
                        {
                            return reject(error);
                        }

                        try
                        {
                            const data = JSON.parse(response.data);
                            
                            resolve({
                                data, 
                                code: response.code, 
                                message: response.message
                            });
                        }
                        catch(error)
                        {
                            return reject(new Error('Expected valid JSON from response'));
                        }
                    });
                }
                catch(error)
                {
                    reject(new Error('Failed to execute function "' + functionName + '"'));
                }
            });
            
            grpc.response = response;
            
            divhunt.Emit('clients.grpc.request.after', grpc);
            await divhunt.Middleware('clients.grpc.request.after', grpc);
            
            if(item.Get('onResponse'))
            {
                item.Get('onResponse')(grpc);
            }
            
            grpc.duration = (performance.now() - grpc.duration).toFixed(2);
            
            const result = {
                data: grpc.response.data,
                code: grpc.response.code,
                message: grpc.response.message,
                duration: grpc.duration
            };
            
            if(item.Get('onComplete'))
            {
                item.Get('onComplete')(result, grpc);
            }
            
            return result;
        }
        catch(error)
        {
            grpc.error = error.message || 'Request failed';
            grpc.duration = (performance.now() - grpc.duration).toFixed(2);
            
            if(item.Get('onError'))
            {
                item.Get('onError')(grpc.error, grpc);
            }
            
            throw new Error(grpc.error);
        }
    };
    
    this.methods.ping = async (requestTimeout = 3) =>
    {
        try
        {
            const response = await this.methods.execute('ping', {}, requestTimeout);
            return response.data.pong === true;
        }
        catch(error)
        {
            if(item.Get('onError'))
            {
                item.Get('onError')('Ping failed: ' + error.message);
            }
            return false;
        }
    };
    
    this.methods.init();
});