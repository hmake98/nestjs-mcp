import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Logger,
    Inject,
    Get,
    Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MCPService } from '../services';
import { MCPRequest, MCPResponse, MCPModuleOptions } from '../interfaces';
import { MCP_MODULE_OPTIONS } from '../constants';

/**
 * Controller for handling MCP protocol requests via HTTP
 */
@Controller('mcp')
export class MCPController {
    private readonly logger = new Logger(MCPController.name);

    constructor(
        private readonly mcpService: MCPService,
        @Inject(MCP_MODULE_OPTIONS)
        private readonly options: MCPModuleOptions,
    ) {}

    /**
     * Handle MCP JSON-RPC requests
     */
    @Post()
    @HttpCode(HttpStatus.OK)
    async handleRequest(@Body() request: MCPRequest): Promise<MCPResponse> {
        if (this.options.enableLogging) {
            this.logger.debug(`Received request: ${JSON.stringify(request)}`);
        }

        const response = await this.mcpService.handleRequest(request);

        if (this.options.enableLogging) {
            this.logger.debug(`Sending response: ${JSON.stringify(response)}`);
        }

        return response;
    }

    /**
     * Handle batch requests (multiple requests in one call)
     */
    @Post('batch')
    @HttpCode(HttpStatus.OK)
    async handleBatchRequest(
        @Body() requests: MCPRequest[],
    ): Promise<MCPResponse[]> {
        if (!Array.isArray(requests)) {
            throw new Error('Batch request must be an array');
        }

        if (this.options.enableLogging) {
            this.logger.debug(
                `Received batch request with ${requests.length} requests`,
            );
        }

        const responses = await Promise.all(
            requests.map((request) => this.mcpService.handleRequest(request)),
        );

        return responses;
    }

    @Get('playground')
    getPlayground(@Res() res: Response) {
        if (this.options.enableLogging) {
            this.logger.log('Serving MCP Playground UI');
        }

        try {
            // Resolve from project root to src/views/playground.html
            const playgroundPath = join(
                /* eslint-disable-next-line no-undef */
                process.cwd(),
                'src',
                'views',
                'playground.html',
            );
            const html = readFileSync(playgroundPath, 'utf-8');
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            this.logger.error('Failed to load playground.html', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(
                'Playground UI not available',
            );
        }
    }
}
