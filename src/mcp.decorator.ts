import { MCPRegistry } from './mcp.registry';

export function MCPTool(name: string, schema: any) {
	return function (this: any, ...args: any[]) {
		MCPRegistry.registerHandler(
			name,
			args[2].value.name.toString(),
			args[2].value,
			schema,
		);
	};
}
