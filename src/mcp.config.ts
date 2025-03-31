import { ConfigSchema } from '@cmmv/core';

export const MCPConfig: ConfigSchema = {
	mcp: {
		name: {
			type: 'string',
			required: true,
			default: 'mcp',
		},
		version: {
			type: 'string',
			required: true,
			default: '0.0.1',
		},
		port: {
			type: 'number',
			required: true,
			default: 8765,
		},
		transport: {
			type: 'string',
			required: true,
			default: 'stdio',
		},
		jwtSecret: {
			type: 'string',
			required: true,
			default: 'your-secret-key',
		},
		pingInterval: {
			type: 'number',
			required: true,
			default: 30000,
		},
		connectionTimeout: {
			type: 'number',
			required: true,
			default: 300000,
		},
	},
};
