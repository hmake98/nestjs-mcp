import { SetMetadata } from '@nestjs/common';
import { MCP_PUBLIC_KEY } from '../constants';

/**
 * Decorator to mark an MCP endpoint as public (bypasses authentication)
 * The playground endpoint uses this automatically.
 *
 * @example
 * ```typescript
 * @Controller('mcp')
 * export class MCPController {
 *   @Get('playground')
 *   @Public()
 *   getPlayground() {
 *     // This endpoint will bypass auth guards
 *   }
 * }
 * ```
 */
export const Public = () => SetMetadata(MCP_PUBLIC_KEY, true);
