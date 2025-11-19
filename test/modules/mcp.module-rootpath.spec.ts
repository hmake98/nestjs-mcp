import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MCPModule } from '../../src/modules';
import { MCPTool } from '../../src/decorators';
import { Injectable } from '@nestjs/common';

@Injectable()
class TestToolProvider {
    @MCPTool({ name: 'test_tool', description: 'Test tool' })
    async testTool() {
        return 'test result';
    }
}

describe('MCPModule rootPath Configuration', () => {
    describe('without rootPath (default behavior)', () => {
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
                providers: [TestToolProvider],
            }).compile();

            app = module.createNestApplication();
            // Set global prefix like a real application would
            app.setGlobalPrefix('v1');
            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it('should respect global prefix (/v1/mcp)', async () => {
            const response = await request(app.getHttpServer())
                .post('/v1/mcp')
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

        it('should NOT respond at root level (/mcp)', async () => {
            await request(app.getHttpServer())
                .post('/mcp')
                .send({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'tools/list',
                })
                .expect(404);
        });
    });

    describe('with rootPath enabled', () => {
        let app: INestApplication;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                imports: [
                    MCPModule.forRoot({
                        serverInfo: {
                            name: 'test-server',
                            version: '1.0.0',
                        },
                        rootPath: true, // Enable root-level endpoints
                        enableLogging: false,
                    }),
                ],
                providers: [TestToolProvider],
            }).compile();

            app = module.createNestApplication();
            // Set global prefix with exclude for MCP routes
            app.setGlobalPrefix('v1', {
                exclude: ['/mcp(.*)'], // Exclude MCP endpoints from global prefix
            });
            await app.init();
        });

        afterEach(async () => {
            await app.close();
        });

        it('should respond at root level (/mcp)', async () => {
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

        it('should NOT respond at prefixed level (/v1/mcp)', async () => {
            await request(app.getHttpServer())
                .post('/v1/mcp')
                .send({
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'tools/list',
                })
                .expect(404);
        });

        it('should handle batch requests at root level (/mcp/batch)', async () => {
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
    });
});
