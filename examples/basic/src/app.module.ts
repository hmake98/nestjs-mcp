import { Module } from '@nestjs/common';
import { MCPModule } from 'nestjs-mcp';
import { CalculatorService } from './tools/calculator.service';
import { FileService } from './resources/file.service';
import { PromptService } from './prompts/prompt.service';

@Module({
    imports: [
        MCPModule.forRoot({
            serverInfo: {
                name: 'example-mcp-server',
                version: '1.0.0',
                capabilities: {
                    tools: { listChanged: true },
                    resources: { subscribe: true, listChanged: true },
                    prompts: { listChanged: true },
                },
            },
            autoDiscoverTools: true,
            autoDiscoverResources: true,
            autoDiscoverPrompts: true,
            logLevel: 'info',
        }),
    ],
    providers: [CalculatorService, FileService, PromptService],
})
export class AppModule {}
