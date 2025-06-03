## Built with the Divhunt Framework – non-commercial use only. For commercial use, contact dejan@divhunt.com.

# Clients Addon

HTTP and gRPC client connectivity for Divhunt applications.

## Features

- **HTTP Client**: REST API communication with timeout, retries, and middleware
- **gRPC Client**: High-performance streaming and unary calls
- **Event Callbacks**: Connection, request, response, and error handling
- **Auto-retry**: Configurable timeout and connection management

## HTTP Client

```javascript
import clients from '#clients/load.js';

clients.Item({
    id: 'api',
    type: 'http',
    host: 'localhost',
    port: 3000,
    timeout: 15,
    onConnect: (client) => console.log('HTTP client connected'),
    onError: (error) => console.error('HTTP error:', error)
});

// Usage
const api = clients.Item('api');
const result = await api.Fn('http.get', '/users', {page: 1});
await api.Fn('http.post', '/users', {name: 'John'});
```

## gRPC Client

```javascript
import clientsGRPC from '#clients/grpc/load.js';

clientsGRPC.Item({
    id: 'service',
    host: 'localhost',
    port: 50000,
    timeout: 15,
    metadata: {authorization: 'Bearer token'},
    onConnect: (client) => console.log('gRPC client connected'),
    onStreamData: (stream, payload) => console.log('Received:', payload)
});

// Streaming
const service = clientsGRPC.Item('service');
const stream = await service.Fn('stream');
const response = await stream.request('users', 'findAll', {limit: 10});
```

## Commands Integration

```javascript
import commands from '#commands/load.js';
import clients from '#clients/load.js';

commands.Item({
    id: 'proxy:users',
    method: 'GET',
    endpoint: '/api/users',
    callback: async function(properties, resolve)
    {
        const api = clients.Item('api');
        const result = await api.Fn('http.get', '/users', properties);
        
        resolve(result.data, result.message, result.code);
    }
});

commands.Item({
    id: 'grpc:analytics',
    method: 'POST',
    endpoint: '/analytics/process',
    callback: async function(properties, resolve)
    {
        const service = clientsGRPC.Item('analytics');
        const stream = await service.Fn('stream');
        const result = await stream.request('analytics', 'process', properties);
        
        resolve(result.data);
    }
});
```

## Error Handling

```javascript
clients.Item({
    id: 'resilient-api',
    type: 'http',
    host: 'api.example.com',
    port: 443,
    onError: (error, context) =>
    {
        console.error(`Request failed: ${error}`);
        // Implement retry logic, fallback, or alerting
    },
    onComplete: (result, context) =>
    {
        console.log(`Request completed in ${result.duration}ms`);
    }
});
```

## Events

```javascript
divhunt.EmitOn('clients.http.request.before', (http) =>
{
    http.data.timestamp = Date.now();
    http.headers = {'X-Client-Version': '1.0.0'};
});

divhunt.EmitOn('clients.grpc.connect', (client) =>
{
    console.log('gRPC client ready for requests');
});
```