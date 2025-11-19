import { Test, TestingModule } from '@nestjs/testing';
import {
    INestApplication,
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { MCPModule } from '../../src/modules';
import { MCPTool } from '../../src/decorators';
import { MCP_PUBLIC_KEY } from '../../src/constants';

@Injectable()
class TestToolProvider {
    @MCPTool({ name: 'test_tool', description: 'Test tool' })
    async testTool() {
        return 'test result';
    }
}

/**
 * Test auth guard that blocks all requests except those marked as public
 */
@Injectable()
class TestAuthGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            MCP_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (isPublic) {
            return true; // Skip auth for public routes
        }

        // Block all non-public routes
        throw new UnauthorizedException('Authentication required');
    }
}

describe('MCPModule Public Routes', () => {
    describe('All MCP endpoints should be public by default', () => {
        let app: INestApplication;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    MCPModule.forRoot({
                        serverInfo: {
                            name: 'test-server',
                            version: '1.0.0',
                        },
                        enableLogging: false,
                    }),
                ],
                providers: [
                    TestToolProvider,
                    {
                        provide: APP_GUARD,
                        useClass: TestAuthGuard,
                    },
                ],
            }).compile();

            app = module.createNestApplication();
            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it('should allow access to POST /mcp without authentication', async () => {
            const response = await request(app.getHttpServer())
                .post('/mcp')
                .send({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'tools/list',
                })
                .expect(200);

            expect(response.body).toMatchObject({
                jsonrpc: '2.0',
                id: 1,
                result: {
                    tools: [
                        {
                            name: 'test_tool',
                            description: 'Test tool',
                        },
                    ],
                },
            });
        });

        it('should allow access to POST /mcp/batch without authentication', async () => {
            const response = await request(app.getHttpServer())
                .post('/mcp/batch')
                .send([
                    {
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'tools/list',
                    },
                    {
                        jsonrpc: '2.0',
                        id: 2,
                        method: 'resources/list',
                    },
                ])
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
        });

        it('should allow access to GET /mcp/playground without authentication', async () => {
            await request(app.getHttpServer())
                .get('/mcp/playground')
                .expect(200);
        });
    });

    describe('With rootPath enabled and global prefix', () => {
        let app: INestApplication;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    MCPModule.forRoot({
                        serverInfo: {
                            name: 'test-server',
                            version: '1.0.0',
                        },
                        rootPath: true,
                        enableLogging: false,
                    }),
                ],
                providers: [
                    TestToolProvider,
                    {
                        provide: APP_GUARD,
                        useClass: TestAuthGuard,
                    },
                ],
            }).compile();

            app = module.createNestApplication();
            app.setGlobalPrefix('v1', {
                exclude: ['/mcp(.*)'],
            });
            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it('should allow access to root-level POST /mcp without authentication', async () => {
            const response = await request(app.getHttpServer())
                .post('/mcp')
                .send({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'tools/list',
                })
                .expect(200);

            expect(response.body).toMatchObject({
                jsonrpc: '2.0',
                id: 1,
            });
        });

        it('should allow access to root-level POST /mcp/batch without authentication', async () => {
            const response = await request(app.getHttpServer())
                .post('/mcp/batch')
                .send([
                    {
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'tools/list',
                    },
                ])
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should allow access to root-level GET /mcp/playground without authentication', async () => {
            await request(app.getHttpServer())
                .get('/mcp/playground')
                .expect(200);
        });
    });

    describe('Custom publicMetadataKey', () => {
        const CUSTOM_PUBLIC_KEY = 'isPublic';

        @Injectable()
        class CustomAuthGuard implements CanActivate {
            constructor(private reflector: Reflector) {}

            canActivate(context: ExecutionContext): boolean {
                const isPublic = this.reflector.getAllAndOverride<boolean>(
                    CUSTOM_PUBLIC_KEY,
                    [context.getHandler(), context.getClass()],
                );

                if (isPublic) {
                    return true;
                }

                throw new UnauthorizedException('Authentication required');
            }
        }

        let app: INestApplication;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    MCPModule.forRoot({
                        serverInfo: {
                            name: 'test-server',
                            version: '1.0.0',
                        },
                        publicMetadataKey: CUSTOM_PUBLIC_KEY,
                        enableLogging: false,
                    }),
                ],
                providers: [
                    TestToolProvider,
                    {
                        provide: APP_GUARD,
                        useClass: CustomAuthGuard,
                    },
                ],
            }).compile();

            app = module.createNestApplication();
            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it('should respect custom publicMetadataKey for POST /mcp', async () => {
            const response = await request(app.getHttpServer())
                .post('/mcp')
                .send({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'tools/list',
                })
                .expect(200);

            expect(response.body.jsonrpc).toBe('2.0');
        });

        it('should respect custom publicMetadataKey for POST /mcp/batch', async () => {
            const response = await request(app.getHttpServer())
                .post('/mcp/batch')
                .send([
                    {
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'tools/list',
                    },
                ])
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
        });

        it('should respect custom publicMetadataKey for GET /mcp/playground', async () => {
            await request(app.getHttpServer())
                .get('/mcp/playground')
                .expect(200);
        });
    });
});
