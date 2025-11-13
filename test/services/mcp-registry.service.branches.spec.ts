import { Test, TestingModule } from '@nestjs/testing';
import { MCPRegistryService } from '../../src/services/mcp-registry.service';
import { MCP_MODULE_OPTIONS } from '../../src/constants';
import { MCPModuleOptions } from '../../src/interfaces';
import { Logger } from '@nestjs/common';

describe('MCPRegistryService - branch coverage additions', () => {
    let service: MCPRegistryService;

    const mockOptions: MCPModuleOptions = {
        serverInfo: {
            name: 'Test',
            version: '1.0.0',
            capabilities: { tools: {}, resources: {}, prompts: {} },
        },
        enableLogging: true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MCPRegistryService,
                {
                    provide: MCP_MODULE_OPTIONS,
                    useValue: mockOptions,
                },
            ],
        }).compile();

        service = module.get<MCPRegistryService>(MCPRegistryService);

        // Silence Nest logger calls used by MCPLogger
        jest.spyOn(Logger.prototype, 'warn').mockImplementation();
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('registerTool should overwrite existing and call warn', () => {
        type ToolDef = {
            name: string;
            handler: () => void;
            parameters: unknown[];
            description?: string;
        };
        const tool: ToolDef = {
            name: 'tool-a',
            handler: () => {},
            parameters: [],
        };
        const tool2: ToolDef = {
            name: 'tool-a',
            handler: () => {},
            parameters: [],
            description: 'new',
        };

        service.registerTool(tool as never);
        expect(service.getTool('tool-a')).toBeDefined();

        service.registerTool(tool2 as never);
        // getTool should return the latest value
        expect(service.getTool('tool-a')?.description).toBe('new');
        expect(Logger.prototype.warn).toHaveBeenCalled();
    });

    it('unregisterTool should remove and return boolean correctly', () => {
        type ToolDef = {
            name: string;
            handler: () => void;
            parameters: unknown[];
        };
        const tool: ToolDef = {
            name: 'to-remove',
            handler: () => {},
            parameters: [],
        };
        service.registerTool(tool as never);

        expect(service.hasTool('to-remove')).toBe(true);
        const deleted = service.unregisterTool('to-remove');
        expect(deleted).toBe(true);
        expect(service.hasTool('to-remove')).toBe(false);

        // Unregister non-existing should return false
        expect(service.unregisterTool('does-not-exist')).toBe(false);
    });

    it('registerResource with uriTemplate should be findable by pattern', () => {
        type ResourceDef = {
            uriTemplate: string;
            handler: () => Record<string, unknown>;
            name: string;
        };
        const resource: ResourceDef = {
            uriTemplate: 'file:///{filename}',
            handler: () => ({}),
            name: 'dynamic',
        };

        service.registerResource(resource as never);

        const found = service.findResourceByPattern('file:///hello.txt');
        expect(found).toBeDefined();
        expect(found?.uriTemplate).toBe('file:///{filename}');
    });

    it('extractUriVariables should return empty for mismatched lengths and map values when matching', () => {
        type ExtractResult = Record<string, string>;
        const template = 'a/b/{id}';
        const shortUri = 'a/b';

        const empty: ExtractResult = service.extractUriVariables(
            template,
            shortUri,
        );
        expect(Object.keys(empty)).toHaveLength(0);

        const fullUri = 'a/b/123';
        const vars: ExtractResult = service.extractUriVariables(
            template,
            fullUri,
        );
        expect(vars).toHaveProperty('id', '123');
    });

    it('registerPrompt should overwrite existing and getAllPrompts should reflect changes', () => {
        type PromptDef = {
            name: string;
            handler: () => void;
            description?: string;
        };
        const p1: PromptDef = { name: 'p', handler: () => {} };
        const p2: PromptDef = {
            name: 'p',
            handler: () => {},
            description: 'updated',
        };

        service.registerPrompt(p1 as never);
        expect(service.getPrompt('p')).toBeDefined();

        service.registerPrompt(p2 as never);
        expect(service.getPrompt('p')?.description).toBe('updated');
        expect(service.getAllPrompts().length).toBeGreaterThan(0);
    });

    it('clear should remove all registrations', () => {
        service.registerTool({
            name: 't1',
            handler: () => {},
            parameters: [],
        } as never);
        service.registerResource({
            uri: 'r1',
            handler: () => {},
            name: 'r1',
        } as never);
        service.registerPrompt({ name: 'pp', handler: () => {} } as never);

        expect(service.getAllTools().length).toBeGreaterThan(0);
        expect(service.getAllResources().length).toBeGreaterThan(0);
        expect(service.getAllPrompts().length).toBeGreaterThan(0);

        service.clear();

        expect(service.getAllTools()).toHaveLength(0);
        expect(service.getAllResources()).toHaveLength(0);
        expect(service.getAllPrompts()).toHaveLength(0);
    });

    it('registerResource should warn when overwriting same uri', () => {
        type ResourceDef = { uri: string; handler: () => void; name: string };
        const res: ResourceDef = {
            uri: 'same://uri',
            handler: () => {},
            name: 'r',
        };
        const res2: ResourceDef = {
            uri: 'same://uri',
            handler: () => {},
            name: 'r2',
        };

        service.registerResource(res as never);
        service.registerResource(res2 as never);

        expect(service.getResource('same://uri')?.name).toBe('r2');
        expect(Logger.prototype.warn).toHaveBeenCalled();
    });

    it('findResourceByPattern should return undefined when pattern does not match', () => {
        type ResourceDef = {
            uriTemplate: string;
            handler: () => Record<string, unknown>;
            name: string;
        };
        const resource: ResourceDef = {
            uriTemplate: 'file:///{name}.txt',
            handler: () => ({}),
            name: 'textfile',
        };

        service.registerResource(resource as never);

        const found = service.findResourceByPattern('file:///image.jpg');
        expect(found).toBeUndefined();
    });
});
