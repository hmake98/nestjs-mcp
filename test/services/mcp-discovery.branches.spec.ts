import { Test, TestingModule } from '@nestjs/testing';
import { MCPDiscoveryService } from '../../src/services/mcp-discovery.service';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { MCP_MODULE_OPTIONS } from '../../src/constants';

describe('MCPDiscoveryService - deprecation message branches', () => {
    let service: MCPDiscoveryService;

    type BuildDeprecationMessageType = {
        buildDeprecationMessage(deprecation: {
            deprecated: boolean;
            message?: string;
            since?: string;
            removeIn?: string;
            replacedBy?: string;
        }): string;
    };

    beforeEach(async () => {
        type DiscoveryServiceValue = { getProviders: jest.Mock<unknown[]> };
        type MetadataScannerValue = { getAllMethodNames: jest.Mock<string[]> };
        type ReflectorValue = { get: jest.Mock<unknown> };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MCPDiscoveryService,
                {
                    provide: DiscoveryService,
                    useValue: {
                        getProviders: jest.fn(),
                    } as DiscoveryServiceValue,
                },
                {
                    provide: MetadataScanner,
                    useValue: {
                        getAllMethodNames: jest.fn(),
                    } as MetadataScannerValue,
                },
                {
                    provide: Reflector,
                    useValue: { get: jest.fn() } as ReflectorValue,
                },
                {
                    provide: MCP_MODULE_OPTIONS,
                    useValue: {
                        enableLogging: false,
                    },
                },
            ],
        }).compile();

        service = module.get<MCPDiscoveryService>(MCPDiscoveryService);
    });

    it('buildDeprecationMessage includes provided message and fields', () => {
        type DeprecationInfo = {
            deprecated: boolean;
            message?: string;
            since?: string;
            removeIn?: string;
            replacedBy?: string;
        };

        const dep: DeprecationInfo = {
            deprecated: true,
            message: 'Use new API',
            since: '1.2.3',
            removeIn: '2.0.0',
            replacedBy: 'newTool',
        };

        const msg = (
            service as unknown as BuildDeprecationMessageType
        ).buildDeprecationMessage(dep);
        expect(msg).toContain('Use new API');
        expect(msg).toContain('Deprecated since 1.2.3');
        expect(msg).toContain('Will be removed in 2.0.0');
        expect(msg).toContain("Use 'newTool' instead.");
    });

    it('buildDeprecationMessage uses default text when message missing', () => {
        type DeprecationInfo = {
            deprecated: boolean;
            message?: string;
            since?: string;
            removeIn?: string;
            replacedBy?: string;
        };

        const dep: DeprecationInfo = {
            deprecated: true,
            since: '0.1.0',
        };

        const msg = (
            service as unknown as BuildDeprecationMessageType
        ).buildDeprecationMessage(dep);
        expect(msg).toContain('This item is deprecated.');
        expect(msg).toContain('Deprecated since 0.1.0');
    });
});
