import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log('');
    console.log('🚀 NestJS MCP Server is running!');
    console.log('');
    console.log(`📍 HTTP Endpoint: http://localhost:${port}/mcp`);
    console.log(`📦 Batch Endpoint: http://localhost:${port}/mcp/batch`);
    console.log('');
    console.log('Try these commands:');
    console.log('');
    console.log('  # List all tools');
    console.log(`  curl -X POST http://localhost:${port}/mcp \\`);
    console.log('    -H "Content-Type: application/json" \\');
    console.log('    -d \'{"jsonrpc":"2.0","id":1,"method":"tools/list"}\'');
    console.log('');
    console.log('  # Call the add tool');
    console.log(`  curl -X POST http://localhost:${port}/mcp \\`);
    console.log('    -H "Content-Type: application/json" \\');
    console.log(
        '    -d \'{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"add","arguments":{"a":5,"b":3}}}\'',
    );
    console.log('');
}

bootstrap();
