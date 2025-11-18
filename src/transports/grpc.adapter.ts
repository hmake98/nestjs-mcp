import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { Buffer } from 'buffer';
import { BaseMCPTransportAdapter } from './base-transport.adapter';
import {
    MCPGrpcOptions,
    MCPRequest,
    MCPResponse as MCPResponseType,
} from '../interfaces';
import { MCPService } from '../services/mcp.service';

// Type imports only (these don't require the package to be installed)
/* eslint-disable @typescript-eslint/no-explicit-any */
type GrpcServer = any;
type GrpcServerCredentials = any;
type GrpcServerUnaryCall<_RequestType, _ResponseType> = any;
type GrpcSendUnaryData<_ResponseType> = any;
type GrpcServerDuplexStream<_RequestType, _ResponseType> = any;
type GrpcServerWritableStream<_RequestType, _ResponseType> = any;
type GrpcServiceClientConstructor = any;
/* eslint-enable @typescript-eslint/no-explicit-any */

interface ProtoGrpcType {
    mcp: {
        MCPService: GrpcServiceClientConstructor;
    };
}

/**
 * gRPC transport adapter for MCP protocol
 * Provides high-performance RPC communication with bidirectional streaming
 *
 * @requires @grpc/grpc-js - Install with: npm install @grpc/grpc-js @grpc/proto-loader
 */
@Injectable()
export class MCPGrpcAdapter extends BaseMCPTransportAdapter {
    private server: GrpcServer | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private grpc: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private protoLoader: any = null;
    private readonly grpcOptions: Required<
        Pick<
            MCPGrpcOptions,
            'port' | 'host' | 'protoPath' | 'packageName' | 'serviceName'
        >
    > &
        MCPGrpcOptions;

    constructor(mcpService: MCPService, options: MCPGrpcOptions = {}) {
        super(mcpService, options);
        this.grpcOptions = {
            port: options.port ?? 50051,
            host: options.host ?? '0.0.0.0',
            protoPath:
                options.protoPath ?? join(__dirname, 'proto', 'mcp.proto'),
            packageName: options.packageName ?? 'mcp',
            serviceName: options.serviceName ?? 'MCPService',
            ...options,
        };
    }

    /**
     * Lazy load gRPC dependencies
     */
    private async loadGrpcDependencies(): Promise<void> {
        if (this.grpc && this.protoLoader) {
            return; // Already loaded
        }

        try {
            this.grpc = await import('@grpc/grpc-js');
            this.protoLoader = await import('@grpc/proto-loader');
        } catch {
            throw new Error(
                'gRPC dependencies not found. Please install them with: npm install @grpc/grpc-js @grpc/proto-loader',
            );
        }
    }

    /**
     * Start the gRPC server
     */
    async start(): Promise<void> {
        if (this.running) {
            this.logger.warn('gRPC transport already running');
            return;
        }

        // Load dependencies first
        await this.loadGrpcDependencies();

        // Load proto file
        const packageDefinition = this.protoLoader.loadSync(
            this.grpcOptions.protoPath,
            {
                keepCase: true,
                longs: String,
                enums: String,
                defaults: true,
                oneofs: true,
            },
        );

        const protoDescriptor = this.grpc.loadPackageDefinition(
            packageDefinition,
        ) as unknown as ProtoGrpcType;

        // Create server
        this.server = new this.grpc.Server();

        // Get service definition
        const serviceDefinition =
            protoDescriptor[
                this.grpcOptions.packageName as keyof ProtoGrpcType
            ];
        const mcpService = (
            serviceDefinition as { MCPService: GrpcServiceClientConstructor }
        ).MCPService;

        // Add service implementation
        this.server.addService(mcpService.service, {
            Call: this.handleCall.bind(this),
            Stream: this.handleStream.bind(this),
            Subscribe: this.handleSubscribe.bind(this),
        });

        // Bind server
        const address = `${this.grpcOptions.host}:${this.grpcOptions.port}`;
        const credentials = this.getServerCredentials();

        await new Promise<void>((resolve, reject) => {
            this.server!.bindAsync(
                address,
                credentials,
                (err: Error | null, _port: number) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.server!.start();
                        this.running = true;
                        this.logger.log(`gRPC transport started on ${address}`);
                        resolve();
                    }
                },
            );
        });
    }

    /**
     * Stop the gRPC server
     */
    async stop(): Promise<void> {
        if (!this.running || !this.server) {
            return;
        }

        await new Promise<void>((resolve) => {
            this.server!.tryShutdown(() => {
                this.running = false;
                this.server = null;
                this.clients.clear();
                this.logger.log('gRPC transport stopped');
                resolve();
            });
        });
    }

    /**
     * Send response to a specific client (via their stream)
     */
    async send(clientId: string, response: MCPResponseType): Promise<void> {
        const stream = this.clients.get(clientId) as
            | GrpcServerWritableStream<unknown, unknown>
            | undefined;

        if (!stream) {
            this.logger.warn(`Cannot send to ${clientId}: no active stream`);
            return;
        }

        try {
            const grpcResponse = this.convertToGrpcResponse(response);
            stream.write(grpcResponse);
            this.logger.debug(`Sent response to ${clientId}`);
        } catch (error) {
            this.logger.error(`Error sending to ${clientId}:`, error);
            throw error;
        }
    }

    /**
     * Broadcast message to all connected streams
     */
    async broadcast(response: MCPResponseType): Promise<void> {
        const grpcResponse = this.convertToGrpcResponse(response);
        const clientIds = Array.from(this.clients.keys());

        for (const clientId of clientIds) {
            const stream = this.clients.get(clientId) as
                | GrpcServerWritableStream<unknown, unknown>
                | undefined;
            if (stream) {
                try {
                    stream.write(grpcResponse);
                } catch (error) {
                    this.logger.error(
                        `Error broadcasting to ${clientId}:`,
                        error,
                    );
                }
            }
        }

        this.logger.debug(`Broadcast to ${clientIds.length} clients`);
    }

    /**
     * Handle unary Call RPC
     */
    private async handleCall(
        call: GrpcServerUnaryCall<unknown, unknown>,
        callback: GrpcSendUnaryData<unknown>,
    ): Promise<void> {
        try {
            const grpcRequest = call.request as {
                jsonrpc: string;
                string_id?: string;
                int_id?: number;
                method: string;
                params_json?: string;
            };
            const request = this.convertFromGrpcRequest(grpcRequest);
            const clientId = this.generateClientId();

            const response = await this.handleRequest(clientId, request);
            const grpcResponse = this.convertToGrpcResponse(response);

            callback(null, grpcResponse);
        } catch (error) {
            callback({
                code: this.grpc.status.INTERNAL,
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }

    /**
     * Handle bidirectional Stream RPC
     */
    private handleStream(call: GrpcServerDuplexStream<unknown, unknown>): void {
        const clientId = this.generateClientId();
        this.onClientConnect(clientId, call);

        call.on('data', async (data: unknown) => {
            try {
                const grpcRequest = data as {
                    jsonrpc: string;
                    string_id?: string;
                    int_id?: number;
                    method: string;
                    params_json?: string;
                };
                const request = this.convertFromGrpcRequest(grpcRequest);

                const response = await this.handleRequest(clientId, request);
                const grpcResponse = this.convertToGrpcResponse(response);

                call.write(grpcResponse);
            } catch (error) {
                this.logger.error(`Error in stream from ${clientId}:`, error);
            }
        });

        call.on('end', () => {
            this.onClientDisconnect(clientId);
            call.end();
        });

        call.on('error', (error: Error) => {
            this.logger.error(`gRPC stream error for ${clientId}:`, error);
            this.onClientDisconnect(clientId);
        });
    }

    /**
     * Handle server streaming Subscribe RPC
     */
    private handleSubscribe(
        call: GrpcServerWritableStream<unknown, unknown>,
    ): void {
        const request = call.request as {
            client_id?: string;
            methods?: string[];
        };
        const clientId = request.client_id || this.generateClientId();

        this.onClientConnect(clientId, call);
        this.logger.log(
            `Client ${clientId} subscribed to methods: ${request.methods?.join(', ') || 'all'}`,
        );

        call.on('cancelled', () => {
            this.onClientDisconnect(clientId);
        });
    }

    /**
     * Convert MCP request from gRPC format
     */
    private convertFromGrpcRequest(grpcRequest: {
        jsonrpc: string;
        string_id?: string;
        int_id?: number;
        method: string;
        params_json?: string;
    }): MCPRequest {
        const id = grpcRequest.string_id ?? grpcRequest.int_id ?? '';
        const params = grpcRequest.params_json
            ? JSON.parse(grpcRequest.params_json)
            : undefined;

        return {
            jsonrpc: '2.0',
            id,
            method: grpcRequest.method,
            params,
        };
    }

    /**
     * Convert MCP response to gRPC format
     */
    private convertToGrpcResponse(response: MCPResponseType): {
        jsonrpc: string;
        string_id?: string;
        int_id?: number;
        result_json?: string;
        error?: {
            code: number;
            message: string;
            data_json?: string;
        };
    } {
        const grpcResponse: {
            jsonrpc: string;
            string_id?: string;
            int_id?: number;
            result_json?: string;
            error?: {
                code: number;
                message: string;
                data_json?: string;
            };
        } = {
            jsonrpc: response.jsonrpc,
        };

        // Set ID
        if (typeof response.id === 'string') {
            grpcResponse.string_id = response.id;
        } else if (typeof response.id === 'number') {
            grpcResponse.int_id = response.id;
        }

        // Set result or error
        if (response.error) {
            grpcResponse.error = {
                code: response.error.code,
                message: response.error.message,
                data_json: response.error.data
                    ? JSON.stringify(response.error.data)
                    : undefined,
            };
        } else if (response.result !== undefined) {
            grpcResponse.result_json = JSON.stringify(response.result);
        }

        return grpcResponse;
    }

    /**
     * Get server credentials based on configuration
     */
    private getServerCredentials(): GrpcServerCredentials {
        if (this.grpcOptions.secure && this.grpcOptions.credentials) {
            return this.grpc.ServerCredentials.createSsl(
                this.grpcOptions.credentials.rootCerts
                    ? Buffer.from(this.grpcOptions.credentials.rootCerts)
                    : null,
                [
                    {
                        private_key: Buffer.from(
                            this.grpcOptions.credentials.privateKey!,
                        ),
                        cert_chain: Buffer.from(
                            this.grpcOptions.credentials.certChain!,
                        ),
                    },
                ],
                false,
            );
        }

        return this.grpc.ServerCredentials.createInsecure();
    }
}
