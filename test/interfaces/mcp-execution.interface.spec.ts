import {
    MCPException,
    MCPForbiddenException,
    MCPUnauthorizedException,
    MCPRateLimitException,
    MCPTimeoutException,
} from '../../src/interfaces/mcp-execution.interface';

describe('MCP exceptions basic coverage', () => {
    it('MCPException stores code, message and data', () => {
        const e = new MCPException(123, 'test error', { foo: 'bar' });
        expect(e.code).toBe(123);
        expect(e.message).toBe('test error');
        expect(e.data).toEqual({ foo: 'bar' });
        expect(e.name).toBe('MCPException');
    });

    it('specialized exceptions set correct default messages and names', () => {
        const f = new MCPForbiddenException();
        expect(f.code).toBe(-32001);
        expect(f.name).toBe('MCPForbiddenException');

        const u = new MCPUnauthorizedException('no auth');
        expect(u.code).toBe(-32002);
        expect(u.message).toBe('no auth');

        const r = new MCPRateLimitException();
        expect(r.code).toBe(-32003);

        const t = new MCPTimeoutException('timeout', { ms: 1000 });
        expect(t.code).toBe(-32004);
        expect(t.data).toEqual({ ms: 1000 });
    });
});
