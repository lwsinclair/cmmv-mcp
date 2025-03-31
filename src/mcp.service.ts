import { ServerResponse, IncomingMessage } from 'http';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';

import {
	Singleton,
	Service,
	Application,
	Interceptor,
	Config,
	Logger,
	Hook,
	HooksType,
} from '@cmmv/core';

import { MCPRegistry } from './mcp.registry';

@Service('mcp')
export class MCPService extends Singleton {
	public static mcpServer: McpServer;
	public static transport: SSEServerTransport | StdioServerTransport | null =
		null;
	public static logger = new Logger('MCPService');

	@Hook(HooksType.onListen)
	public static async loadConfig(): Promise<void> {
		const port = Config.get<number>('mcp.port', 8765);
		const name = Config.get<string>('mcp.name', 'mcp');
		const version = Config.get<string>('mcp.version', '0.0.1');
		const transport = Config.get<string>('mcp.transport', 'sse');

		MCPService.mcpServer = new McpServer({
			name,
			version,
		});

		await MCPService.processHandlers();

		if (transport === 'stdio') {
			const transport = new StdioServerTransport();
			await MCPService.mcpServer.connect(transport);
			MCPService.logger.log(`MCPServer running with stdio transport`);
		} else if (transport === 'sse') {
			MCPService.transport = null;

			const app = express();

			app.get(
				'/sse',
				async (req: express.Request, res: express.Response) => {
					MCPService.transport = new SSEServerTransport(
						'/messages',
						res as unknown as ServerResponse<IncomingMessage>,
					);
					await MCPService.mcpServer.connect(MCPService.transport);
				},
			);

			app.post(
				'/messages',
				async (req: express.Request, res: express.Response) => {
					if (
						MCPService.transport &&
						MCPService.transport instanceof SSEServerTransport
					) {
						await MCPService.transport.handlePostMessage(req, res);
					}
				},
			);

			app.listen(port, () => {
				MCPService.logger.log(
					`MCP Server running with SSE on http://localhost:${port}/sse`,
				);
			});
		}
	}

	public static async processHandlers() {
		MCPRegistry.getHandlers().forEach(async (handler) => {
			const [message, { schema, consumes }] = handler;

			for (const consume of consumes)
				MCPService.mcpServer.tool(
					consume.handlerName,
					consume.schema,
					consume.cb,
				);
		});
	}
}
