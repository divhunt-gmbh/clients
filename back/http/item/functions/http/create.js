import divhunt from '#framework/load.js';
import clients from '#clients/addon.js';

clients.Fn('item.http.create', function(item)
{
    const { host, port, timeout } = item.Get(['host', 'port', 'timeout']);
    
    if(item.Get('instance'))
    {
        item.Get('onError') && item.Get('onError')('HTTP Client already created.');
        return;
    }
    
    this.methods.init = () =>
    {
        const baseUrl = `http://${host}:${port}`;
        
        const client = {
            baseUrl,
            request: this.methods.request
        };
        
        item.Set('instance', client);
        
        if(item.Get('onConnect'))
        {
            item.Get('onConnect')(client);
        }
        
        divhunt.Emit('clients.http.connect', client);
    };
    
    this.methods.request = async (path, method = 'GET', data = {}, requestTimeout = timeout) =>
    {
        const client = item.Get('instance');
        
        if(!client)
        {
            throw new Error('HTTP Client not initialized.');
        }
        
        const http = {
            id: item.Get('id'),
            client,
            path,
            method,
            data,
            url: `${client.baseUrl}${path}`,
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
            divhunt.Emit('clients.http.request.before', http);
            await divhunt.Middleware('clients.http.request.before', http);
            
            if(item.Get('onRequest'))
            {
                await Promise.resolve(item.Get('onRequest')(http));
            }
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), requestTimeout * 1000);
            
            const options = {
                method: http.method,
                headers: {
                    'Content-Type': 'application/json'
                },
                signal: controller.signal
            };
            
            if(http.method !== 'GET' && http.data)
            {
                options.body = JSON.stringify(http.data);
            }
            
            const response = await fetch(http.url, options);
            clearTimeout(timeoutId);
            
            http.response.code = response.status;
            http.response.message = response.statusText;
            
            const contentType = response.headers.get('content-type');
            
            if(contentType && contentType.includes('application/json'))
            {
                http.response.data = await response.json();
            }
            else
            {
                http.response.data = await response.text();
            }
            
            divhunt.Emit('clients.http.request.after', http);
            await divhunt.Middleware('clients.http.request.after', http);
            
            if(item.Get('onResponse'))
            {
                item.Get('onResponse')(http);
            }
            
            http.duration = (performance.now() - http.duration).toFixed(2);
            
            const result = {
                data: http.response.data,
                code: http.response.code,
                message: http.response.message,
                duration: http.duration
            };
            
            if(item.Get('onComplete'))
            {
                item.Get('onComplete')(result, http);
            }
            
            return result;
        }
        catch(error)
        {
            http.error = error.message || 'Request failed';
            http.duration = (performance.now() - http.duration).toFixed(2);
            
            if(item.Get('onError'))
            {
                item.Get('onError')(http.error, http);
            }
            
            throw new Error(http.error);
        }
    };
    
    this.methods.init();
});