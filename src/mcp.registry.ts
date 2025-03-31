import { z } from 'zod';

export class MCPRegistry {
	public static handlers = new Map<
		string,
		{ consumes: any[]; schema: z.ZodSchema }
	>();

	public static registerHandler(
		message: string,
		handlerName: string,
		callback: Function,
		schema: z.ZodSchema,
	) {
		let events = this.handlers.get(message);

		if (!events) {
			this.handlers.set(message, {
				consumes: [],
				schema: schema,
			});

			events = this.handlers.get(message);
		}

		if (events) {
			const handler = events.consumes.find(
				(msg) => msg.handlerName === handlerName,
			);

			if (!handler) {
				events.consumes.push({
					handlerName,
					cb: callback,
					schema: schema,
				});
			} else handler.cb = callback;
		}
	}

	public static getHandlers() {
		return Array.from(this.handlers.entries());
	}

	public static getConsumes(target: any): any[] {
		const events = this.handlers.get(target);
		return events ? events.consumes : [];
	}

	public static clear() {
		MCPRegistry.handlers = new Map<
			string,
			{
				consumes: any[];
				schema: z.ZodSchema;
			}
		>();
	}
}
