import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import app from "./app";
import { TrelloClient } from "./trello-client";
import { registerTrelloTools } from "./trello-tools";

export class MyMCP extends McpAgent<Env> {
	server = new McpServer({
		name: "Trello MCP",
		version: "1.0.0",
	});

	async init() {
		const env = this.env as Env;
		if (!env?.TRELLO_API_KEY || !env?.TRELLO_TOKEN) {
			throw new Error("Missing TRELLO_API_KEY or TRELLO_TOKEN in environment.");
		}

		const trelloClient = new TrelloClient(env.TRELLO_API_KEY, env.TRELLO_TOKEN);
		registerTrelloTools(this.server, trelloClient);
	}
}

// Export the OAuth handler as the default
export default new OAuthProvider({
	apiRoute: "/sse",
	// TODO: fix these types
	apiHandler: MyMCP.mount("/sse"),
	// @ts-expect-error
	defaultHandler: app,
	authorizeEndpoint: "/authorize",
	tokenEndpoint: "/token",
	clientRegistrationEndpoint: "/register",
});
