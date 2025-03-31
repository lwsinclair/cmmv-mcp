import { Module } from '@cmmv/core';

import { MCPConfig } from './mcp.config';
import { MCPService } from './mcp.service';

export const MCPModule = new Module('module', {
	configs: [MCPConfig],
	providers: [MCPService],
});
