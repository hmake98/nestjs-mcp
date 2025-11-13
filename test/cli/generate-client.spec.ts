import { generateClient } from '../../src/cli/generate-client';
import { introspectServer } from '../../src/cli/introspector';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

jest.mock('../../src/cli/introspector');
jest.mock('node:fs');
jest.mock('node:path');

describe('generateClient', () => {
    const mockIntrospection = {
        tools: [
            {
                name: 'testTool',
                description: 'A test tool',
                parameters: [
                    {
                        name: 'param1',
                        type: 'string',
                        description: 'First parameter',
                        required: true,
                    },
                    {
                        name: 'param2',
                        type: 'number',
                        description: 'Second parameter',
                        required: false,
                        enum: [1, 2, 3],
                    },
                ],
                version: '1.0.0',
                deprecated: false,
            },
            {
                name: 'deprecatedTool',
                description: 'A deprecated tool',
                parameters: [],
                version: '1.0.0',
                deprecated: true,
                deprecationMessage: 'Use newTool instead',
            },
            {
                name: 'noParamTool',
                description: 'Tool without parameters',
                parameters: [],
            },
        ],
        resources: [
            {
                name: 'staticResource',
                description: 'A static resource',
                uri: 'resource://static',
            },
            {
                name: 'templateResource',
                description: 'A template resource',
                uriTemplate: 'resource://template/{id}',
            },
            {
                name: 'special-resource-name',
                uri: 'resource://special',
            },
        ],
        prompts: [
            {
                name: 'promptWithArgs',
                description: 'A prompt with arguments',
                arguments: [
                    {
                        name: 'arg1',
                        description: 'First argument',
                        required: true,
                    },
                    {
                        name: 'arg2',
                        description: 'Second argument',
                        required: false,
                    },
                ],
            },
            {
                name: 'promptNoArgs',
                description: 'A prompt without arguments',
                arguments: [],
            },
            {
                name: 'promptOptionalArgs',
                description: 'A prompt with optional arguments',
            },
        ],
        serverInfo: {
            name: 'Test Server',
            version: '2.0.0',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (introspectServer as jest.Mock).mockResolvedValue(mockIntrospection);
        (join as jest.Mock).mockImplementation((...args) => args.join('/'));
        (mkdirSync as jest.Mock).mockImplementation(() => {});
        (writeFileSync as jest.Mock).mockImplementation(() => {});

        // Mock console.log
        /* eslint-disable no-undef */
        jest.spyOn(console, 'log').mockImplementation();
        /* eslint-enable no-undef */
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should generate client with all components', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        expect(introspectServer).toHaveBeenCalledWith('http://localhost:3000');
        expect(mkdirSync).toHaveBeenCalledWith('/output', { recursive: true });
        expect(mkdirSync).toHaveBeenCalledWith('/output/tools', {
            recursive: true,
        });
        expect(mkdirSync).toHaveBeenCalledWith('/output/resources', {
            recursive: true,
        });
        expect(mkdirSync).toHaveBeenCalledWith('/output/prompts', {
            recursive: true,
        });
        expect(mkdirSync).toHaveBeenCalledWith('/output/types', {
            recursive: true,
        });
    });

    it('should generate type definitions for tools with parameters', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const typesCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/types/index.ts',
        );
        expect(typesCalls.length).toBeGreaterThan(0);

        const typesContent = typesCalls[0][1];
        expect(typesContent).toContain('TestToolParams');
        expect(typesContent).toContain('param1');
        expect(typesContent).toContain('param2');
    });

    it('should generate tool wrappers with correct signatures', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const toolsCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/tools/index.ts',
        );
        expect(toolsCalls.length).toBeGreaterThan(0);

        const toolsContent = toolsCalls[0][1];
        expect(toolsContent).toContain('class Tools');
        expect(toolsContent).toContain("['testTool']");
        expect(toolsContent).toContain('Types.TestToolParams');
        expect(toolsContent).toContain('@version 1.0.0');
        expect(toolsContent).toContain('@deprecated Use newTool instead');
    });

    it('should generate tool wrapper without parameters', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const toolsCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/tools/index.ts',
        );
        const toolsContent = toolsCalls[0][1];
        expect(toolsContent).toContain("['noParamTool']()");
    });

    it('should generate resource wrappers for static resources', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const resourcesCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/resources/index.ts',
        );
        expect(resourcesCalls.length).toBeGreaterThan(0);

        const resourcesContent = resourcesCalls[0][1];
        expect(resourcesContent).toContain('class Resources');
        expect(resourcesContent).toContain('async read(uri: string)');
        expect(resourcesContent).toContain('staticresource');
        expect(resourcesContent).toContain('resource://static');
    });

    it('should handle resources with special characters in name', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const resourcesCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/resources/index.ts',
        );
        const resourcesContent = resourcesCalls[0][1];
        expect(resourcesContent).toContain('special_resource_name');
    });

    it('should not generate methods for template resources', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const resourcesCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/resources/index.ts',
        );
        const resourcesContent = resourcesCalls[0][1];
        expect(resourcesContent).not.toContain('templateresource');
    });

    it('should generate prompt wrappers with arguments', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const promptsCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/prompts/index.ts',
        );
        expect(promptsCalls.length).toBeGreaterThan(0);

        const promptsContent = promptsCalls[0][1];
        expect(promptsContent).toContain('class Prompts');
        expect(promptsContent).toContain("['promptWithArgs']");
        expect(promptsContent).toContain('Types.PromptWithArgsArgs');
    });

    it('should generate prompt wrapper without arguments', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const promptsCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/prompts/index.ts',
        );
        const promptsContent = promptsCalls[0][1];
        expect(promptsContent).toContain("['promptNoArgs']()");
    });

    it('should generate client runtime', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const clientCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/client.ts',
        );
        expect(clientCalls.length).toBeGreaterThan(0);

        const clientContent = clientCalls[0][1];
        expect(clientContent).toContain('class MCPClient');
        expect(clientContent).toContain('async call(method: string');
        expect(clientContent).toContain('async callTool');
        expect(clientContent).toContain('async readResource');
        expect(clientContent).toContain('async getPrompt');
    });

    it('should generate main index file with server info', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'MyTestClient',
        });

        const indexCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/index.ts',
        );
        expect(indexCalls.length).toBeGreaterThan(0);

        const indexContent = indexCalls[0][1];
        expect(indexContent).toContain('MyTestClient');
        expect(indexContent).toContain('Test Server v2.0.0');
        expect(indexContent).toContain('createClient');
        expect(indexContent).toContain('tools: new Tools');
        expect(indexContent).toContain('resources: new Resources');
        expect(indexContent).toContain('prompts: new Prompts');
    });

    it('should generate package.json with correct name', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'my-awesome-client',
        });

        const packageCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/package.json',
        );
        expect(packageCalls.length).toBeGreaterThan(0);

        const packageContent = JSON.parse(packageCalls[0][1]);
        expect(packageContent.name).toBe('my-awesome-client');
        expect(packageContent.version).toBe('1.0.0');
        expect(packageContent.main).toBe('index.ts');
        expect(packageContent.types).toBe('index.ts');
        expect(packageContent.private).toBe(true);
    });

    it('should log generation summary', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        /* eslint-disable no-undef */
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('Generated client structure'),
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('3 tools'),
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('3 resources'),
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('3 prompts'),
        );
        /* eslint-enable no-undef */
    });

    it('should handle tools with enum parameters', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const typesCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/types/index.ts',
        );
        const typesContent = typesCalls[0][1];
        expect(typesContent).toContain('param2');
    });

    it('should generate type for prompts with arguments', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const typesCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/types/index.ts',
        );
        const typesContent = typesCalls[0][1];
        expect(typesContent).toContain('PromptWithArgsArgs');
        expect(typesContent).toContain('arg1');
        expect(typesContent).toContain('arg2');
    });

    it('should not generate type for prompts without arguments', async () => {
        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const typesCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/types/index.ts',
        );
        const typesContent = typesCalls[0][1];
        expect(typesContent).not.toContain('PromptNoArgsArgs');
        expect(typesContent).not.toContain('PromptOptionalArgsArgs');
    });

    it('should handle empty introspection results', async () => {
        (introspectServer as jest.Mock).mockResolvedValue({
            tools: [],
            resources: [],
            prompts: [],
            serverInfo: {
                name: 'Empty Server',
                version: '1.0.0',
            },
        });

        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        /* eslint-disable no-undef */
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('0 tools'),
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('0 resources'),
        );
        expect(console.log).toHaveBeenCalledWith(
            expect.stringContaining('0 prompts'),
        );
        /* eslint-enable no-undef */
    });

    it('should handle tool without description', async () => {
        (introspectServer as jest.Mock).mockResolvedValue({
            tools: [
                {
                    name: 'noDescTool',
                    parameters: [],
                },
            ],
            resources: [],
            prompts: [],
            serverInfo: { name: 'Test', version: '1.0.0' },
        });

        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const toolsCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/tools/index.ts',
        );
        const toolsContent = toolsCalls[0][1];
        expect(toolsContent).toContain("['noDescTool']");
    });

    it('should handle resource without description', async () => {
        (introspectServer as jest.Mock).mockResolvedValue({
            tools: [],
            resources: [
                {
                    name: 'noDescResource',
                    uri: 'resource://nodesc',
                },
            ],
            prompts: [],
            serverInfo: { name: 'Test', version: '1.0.0' },
        });

        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const resourcesCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/resources/index.ts',
        );
        const resourcesContent = resourcesCalls[0][1];
        expect(resourcesContent).toContain('noDescResource');
    });

    it('should handle deprecated tool without deprecation message', async () => {
        (introspectServer as jest.Mock).mockResolvedValue({
            tools: [
                {
                    name: 'deprecatedNoMsg',
                    description: 'Tool',
                    parameters: [],
                    deprecated: true,
                },
            ],
            resources: [],
            prompts: [],
            serverInfo: { name: 'Test', version: '1.0.0' },
        });

        await generateClient({
            serverUrl: 'http://localhost:3000',
            outputDir: '/output',
            clientName: 'test-client',
        });

        const toolsCalls = (writeFileSync as jest.Mock).mock.calls.filter(
            (call) => call[0] === '/output/tools/index.ts',
        );
        const toolsContent = toolsCalls[0][1];
        expect(toolsContent).toContain('@deprecated This tool is deprecated');
    });
});
