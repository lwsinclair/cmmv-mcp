<p align="center">
  <a href="https://cmmv.io/" target="blank"><img src="https://raw.githubusercontent.com/cmmvio/docs.cmmv.io/main/public/assets/logo_CMMV2_icon.png" width="300" alt="CMMV Logo" /></a>
</p>
<p align="center">Contract-Model-Model-View (CMMV) <br/> Building scalable and modular applications using contracts.</p>
<p align="center">
    <a href="https://www.npmjs.com/package/@cmmv/mcp"><img src="https://img.shields.io/npm/v/@cmmv/mcp.svg" alt="NPM Version" /></a>
    <a href="https://github.com/cmmvio/cmmv/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@cmmv/mcp.svg" alt="Package License" /></a>
</p>

<p align="center">
  <a href="https://cmmv.io">Documentation</a> &bull;
  <a href="https://github.com/cmmvio/cmmv/issues">Report Issue</a>
</p>

## Description

O módulo `@cmmv/mcp` implementa o Model Context Protocol (MCP) para aplicações CMMV, permitindo interações padronizadas entre LLMs (Large Language Models) e a sua aplicação. O MCP proporciona uma interface estruturada para definir ferramentas (tools) que podem ser utilizadas por modelos de IA em um formato padronizado.

## Features

- **Integração com LLMs**: Facilita a comunicação bidirecional entre sua aplicação e modelos de linguagem.
- **Transporte Flexível**: Suporte para transporte via Server-Sent Events (SSE) ou Standard I/O.
- **API Decorator-Based**: Decorators intuitivos como `@MCPTool` para registrar ferramentas.
- **Validação com Zod**: Validação de schemas para parâmetros de entrada usando Zod.
- **Gerenciamento de Conexões**: Implementação robusta para múltiplas conexões simultâneas.

## Installation

Instale o pacote `@cmmv/mcp` via pnpm:

```bash
$ pnpm add @cmmv/mcp
```

## Configuration

Configure o módulo MCP no arquivo `.env` ou através do `ConfigSchema`:

```typescript
// Exemplo de configuração com ConfigSchema
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
      default: 'sse', // 'sse' ou 'stdio'
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
```

## Setting Up the Application

No seu arquivo principal, inclua o `MCPModule` e configure sua aplicação:

```typescript
import { Application, Config } from '@cmmv/core';
import { DefaultAdapter, DefaultHTTPModule } from '@cmmv/http';
import { MCPModule } from '@cmmv/mcp';
import { MCPHandlers } from './mcp-handlers';

Config.assign({
  server: {
    port: 8766,
  },
});

Application.create({
  httpAdapter: DefaultAdapter,
  modules: [MCPModule],
  providers: [MCPHandlers],
});
```

## Creating MCP Tool Handlers

Use o decorator `@MCPTool` para registrar ferramentas que podem ser usadas pelos LLMs:

```typescript
import { MCPTool, z } from '@cmmv/mcp';

export class MCPHandlers {
  @MCPTool('greet', {
    name: z.string(),
    age: z.number(),
  })
  public async greet({ name, age }: { name: string; age: number }) {
    return {
      content: `Hello ${name}, you are ${age} years old`,
    };
  }
}
```

## Using the MCP Client

O cliente MCP pode se conectar ao seu servidor usando o endpoint SSE:

```bash
# Usando curl para teste
curl -X POST http://localhost:8765/messages \
  -H "Content-Type: application/json" \
  -d '{"type":"tool_call","name":"greet","arguments":{"name":"John","age":30}}'
```

## Decorators

### `@MCPTool(name: string, schema: Record<string, z.ZodSchema>)`

Registra um método como uma ferramenta MCP com nome e schema de validação.

## Best Practices

* **Define Schemas Clearly**: Use Zod schemas para definir claramente os parâmetros esperados por cada ferramenta.
* **Provide Meaningful Responses**: Retorne respostas estruturadas que sejam úteis para o LLM.
* **Handle Errors Gracefully**: Implemente tratamento de erros robusto em seus handlers.
* **Security First**: Considere autenticação JWT para endpoints públicos.
* **Performance**: Implemente timeout e mantenha os handlers leves e rápidos.

## Exemplo de Transporte SSE Completo

Para usar o transporte SSE na produção, configure o servidor com um código semelhante a:

```typescript
app.get("/sse", async (req, res) => {
    // Configure headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Create transport
    const transport = new SSEServerTransport("/messages", res);
    await mcpServer.connect(transport);
    
    // Handle disconnection
    req.on('close', () => {
        console.log("Client disconnected");
    });
});

app.post("/messages", async (req, res) => {
    if (transport instanceof SSEServerTransport) {
        await transport.handlePostMessage(req, res);
    }
});
```

O módulo `@cmmv/mcp` oferece uma maneira padronizada e robusta de integrar capacidades de LLM em suas aplicações CMMV, permitindo que você estenda facilmente sua aplicação com interações baseadas em IA.
