const DEFAULT_BASE_URL = "https://api.trello.com/1";

type RequestParams = Record<string, string | number | boolean | undefined>;

export class TrelloClient {
	private apiKey: string;
	private token: string;
	private baseUrl: string;

	constructor(apiKey: string, token: string, baseUrl: string = DEFAULT_BASE_URL) {
		this.apiKey = apiKey;
		this.token = token;
		this.baseUrl = baseUrl;
	}

	private buildUrl(path: string, params?: RequestParams): URL {
		const url = new URL(`${this.baseUrl}${path}`);
		url.searchParams.set("key", this.apiKey);
		url.searchParams.set("token", this.token);
		if (params) {
			for (const [key, value] of Object.entries(params)) {
				if (value === undefined) {
					continue;
				}
				url.searchParams.set(key, String(value));
			}
		}
		return url;
	}

	private async request<T>(
		method: string,
		path: string,
		params?: RequestParams,
		body?: RequestParams,
	): Promise<T> {
		const url = this.buildUrl(path, params);
		const init: RequestInit = { method };

		if (body && Object.keys(body).length > 0) {
			const form = new URLSearchParams();
			for (const [key, value] of Object.entries(body)) {
				if (value === undefined) {
					continue;
				}
				form.set(key, String(value));
			}
			init.body = form.toString();
			init.headers = {
				"content-type": "application/x-www-form-urlencoded",
			};
		}

		const response = await fetch(url, init);
		if (!response.ok) {
			const message = await response.text();
			throw new Error(
				`Trello API error ${response.status}: ${message || response.statusText}`,
			);
		}

		const contentType = response.headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			return (await response.json()) as T;
		}

		return (await response.text()) as T;
	}

	async getBoards() {
		return this.request("GET", "/members/me/boards");
	}

	async getBoard(boardId: string) {
		return this.request("GET", `/boards/${boardId}`, {
			lists: "open",
			cards: "open",
			labels: "all",
			members: "all",
			memberships: "all",
		});
	}

	async getBoardMembers(boardId: string) {
		return this.request("GET", `/boards/${boardId}/members`);
	}

	async getLists(boardId: string) {
		return this.request("GET", `/boards/${boardId}/lists`);
	}

	async createList(boardId: string, name: string, position?: string) {
		return this.request("POST", "/lists", undefined, {
			name,
			idBoard: boardId,
			pos: position || "bottom",
		});
	}

	async updateList(listId: string, updates: { name?: string; closed?: boolean; position?: number }) {
		return this.request("PUT", `/lists/${listId}`, undefined, {
			name: updates.name,
			closed: updates.closed,
			pos: updates.position,
		});
	}

	async getCards(boardId?: string, listId?: string) {
		if (listId) {
			return this.request("GET", `/lists/${listId}/cards`);
		}
		if (boardId) {
			return this.request("GET", `/boards/${boardId}/cards`);
		}
		throw new Error("Either boardId or listId must be provided.");
	}

	async getCard(cardId: string) {
		return this.request("GET", `/cards/${cardId}`);
	}

	async createCard(args: {
		listId: string;
		name: string;
		description?: string;
		due?: string;
		position?: string;
	}) {
		return this.request("POST", "/cards", undefined, {
			idList: args.listId,
			name: args.name,
			desc: args.description,
			due: args.due,
			pos: args.position || "bottom",
		});
	}

	async updateCard(args: {
		cardId: string;
		name?: string;
		description?: string;
		due?: string;
		dueComplete?: boolean;
		closed?: boolean;
	}) {
		return this.request("PUT", `/cards/${args.cardId}`, undefined, {
			name: args.name,
			desc: args.description,
			due: args.due,
			dueComplete: args.dueComplete,
			closed: args.closed,
		});
	}

	async moveCard(args: { cardId: string; listId: string; position?: string }) {
		return this.request("PUT", `/cards/${args.cardId}`, undefined, {
			idList: args.listId,
			pos: args.position || "bottom",
		});
	}

	async deleteCard(cardId: string) {
		return this.request("DELETE", `/cards/${cardId}`);
	}

	async addCardMember(cardId: string, memberId: string) {
		return this.request("POST", `/cards/${cardId}/idMembers`, undefined, {
			value: memberId,
		});
	}

	async removeCardMember(cardId: string, memberId: string) {
		return this.request("DELETE", `/cards/${cardId}/idMembers/${memberId}`);
	}

	async getLabels(boardId: string) {
		return this.request("GET", `/boards/${boardId}/labels`);
	}

	async createLabel(boardId: string, name: string, color: string) {
		return this.request("POST", "/labels", undefined, {
			idBoard: boardId,
			name,
			color,
		});
	}

	async addCardLabel(cardId: string, labelId: string) {
		return this.request("POST", `/cards/${cardId}/idLabels`, undefined, {
			value: labelId,
		});
	}

	async removeCardLabel(cardId: string, labelId: string) {
		return this.request("DELETE", `/cards/${cardId}/idLabels/${labelId}`);
	}

	async getCardChecklists(cardId: string) {
		return this.request("GET", `/cards/${cardId}/checklists`);
	}

	async createChecklist(cardId: string, name: string) {
		return this.request("POST", "/checklists", undefined, {
			idCard: cardId,
			name,
		});
	}

	async addChecklistItem(checklistId: string, name: string, position?: string) {
		return this.request("POST", `/checklists/${checklistId}/checkItems`, undefined, {
			name,
			pos: position || "bottom",
		});
	}

	async updateChecklistItem(cardId: string, itemId: string, state: "complete" | "incomplete") {
		return this.request("PUT", `/cards/${cardId}/checkItem/${itemId}`, undefined, {
			state,
		});
	}

	async deleteChecklist(checklistId: string) {
		return this.request("DELETE", `/checklists/${checklistId}`);
	}
}
