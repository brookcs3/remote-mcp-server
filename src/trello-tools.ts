import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TrelloClient } from "./trello-client";

export function registerTrelloTools(server: McpServer, trelloClient: TrelloClient) {
	// Board tools
	server.tool("list_boards", {}, async () => ({
		content: [{ type: "text", text: JSON.stringify(await trelloClient.getBoards(), null, 2) }],
	}));

	server.tool("get_board", { boardId: z.string().min(1) }, async ({ boardId }) => ({
		content: [{ type: "text", text: JSON.stringify(await trelloClient.getBoard(boardId), null, 2) }],
	}));

	server.tool("get_board_members", { boardId: z.string().min(1) }, async ({ boardId }) => ({
		content: [{ type: "text", text: JSON.stringify(await trelloClient.getBoardMembers(boardId), null, 2) }],
	}));

	// List tools
	server.tool("get_lists", { boardId: z.string().min(1) }, async ({ boardId }) => ({
		content: [{ type: "text", text: JSON.stringify(await trelloClient.getLists(boardId), null, 2) }],
	}));

	server.tool(
		"create_list",
		{
			boardId: z.string().min(1),
			name: z.string().min(1),
			position: z.string().optional().default("bottom"),
		},
		async ({ boardId, name, position }) => ({
			content: [{ type: "text", text: JSON.stringify(await trelloClient.createList(boardId, name, position), null, 2) }],
		})
	);

	server.tool(
		"update_list",
		{
			listId: z.string().min(1),
			name: z.string().optional(),
			closed: z.boolean().optional(),
			position: z.number().optional(),
		},
		async ({ listId, ...updates }) => ({
			content: [{ type: "text", text: JSON.stringify(await trelloClient.updateList(listId, updates), null, 2) }],
		})
	);

	// Card tools
	server.tool(
		"get_cards",
		{
			boardId: z.string().optional(),
			listId: z.string().optional(),
		},
		async ({ boardId, listId }) => ({
			content: [{ type: "text", text: JSON.stringify(await trelloClient.getCards(boardId, listId), null, 2) }],
		})
	);

	server.tool("get_card", { cardId: z.string().min(1) }, async ({ cardId }) => ({
		content: [{ type: "text", text: JSON.stringify(await trelloClient.getCard(cardId), null, 2) }],
	}));

	server.tool(
		"create_card",
		{
			listId: z.string().min(1),
			name: z.string().min(1),
			description: z.string().optional(),
			due: z.string().optional(),
			position: z.string().optional().default("bottom"),
		},
		async (args) => ({
			content: [{ type: "text", text: JSON.stringify(await trelloClient.createCard(args), null, 2) }],
		})
	);

	server.tool(
		"update_card",
		{
			cardId: z.string().min(1),
			name: z.string().optional(),
			description: z.string().optional(),
			due: z.string().optional(),
			dueComplete: z.boolean().optional(),
			closed: z.boolean().optional(),
		},
		async (args) => ({
			content: [{ type: "text", text: JSON.stringify(await trelloClient.updateCard(args), null, 2) }],
		})
	);

	server.tool(
		"move_card",
		{
			cardId: z.string().min(1),
			listId: z.string().min(1),
			position: z.string().optional().default("bottom"),
		},
		async (args) => ({
			content: [{ type: "text", text: JSON.stringify(await trelloClient.moveCard(args), null, 2) }],
		})
	);

	server.tool("delete_card", { cardId: z.string().min(1) }, async ({ cardId }) => {
		await trelloClient.deleteCard(cardId);
		return { content: [{ type: "text", text: `Deleted card ${cardId}` }] };
	});

	server.tool(
		"add_card_member",
		{ cardId: z.string().min(1), memberId: z.string().min(1) },
		async ({ cardId, memberId }) => {
			await trelloClient.addCardMember(cardId, memberId);
			return { content: [{ type: "text", text: `Added member ${memberId} to card ${cardId}` }] };
		}
	);

	server.tool(
		"remove_card_member",
		{ cardId: z.string().min(1), memberId: z.string().min(1) },
		async ({ cardId, memberId }) => {
			await trelloClient.removeCardMember(cardId, memberId);
			return { content: [{ type: "text", text: `Removed member ${memberId} from card ${cardId}` }] };
		}
	);

	// Label tools
	server.tool("get_labels", { boardId: z.string().min(1) }, async ({ boardId }) => ({
		content: [{ type: "text", text: JSON.stringify(await trelloClient.getLabels(boardId), null, 2) }],
	}));

	server.tool(
		"create_label",
		{
			boardId: z.string().min(1),
			name: z.string().min(1),
			color: z.enum(["yellow", "purple", "blue", "red", "green", "orange", "black", "sky", "pink", "lime"]),
		},
		async ({ boardId, name, color }) => ({
			content: [{ type: "text", text: JSON.stringify(await trelloClient.createLabel(boardId, name, color), null, 2) }],
		})
	);

	server.tool(
		"add_card_label",
		{ cardId: z.string().min(1), labelId: z.string().min(1) },
		async ({ cardId, labelId }) => {
			await trelloClient.addCardLabel(cardId, labelId);
			return { content: [{ type: "text", text: `Added label ${labelId} to card ${cardId}` }] };
		}
	);

	server.tool(
		"remove_card_label",
		{ cardId: z.string().min(1), labelId: z.string().min(1) },
		async ({ cardId, labelId }) => {
			await trelloClient.removeCardLabel(cardId, labelId);
			return { content: [{ type: "text", text: `Removed label ${labelId} from card ${cardId}` }] };
		}
	);

	// Checklist tools
	server.tool("get_card_checklists", { cardId: z.string().min(1) }, async ({ cardId }) => ({
		content: [{ type: "text", text: JSON.stringify(await trelloClient.getCardChecklists(cardId), null, 2) }],
	}));

	server.tool(
		"create_checklist",
		{ cardId: z.string().min(1), name: z.string().min(1) },
		async ({ cardId, name }) => ({
			content: [{ type: "text", text: JSON.stringify(await trelloClient.createChecklist(cardId, name), null, 2) }],
		})
	);

	server.tool(
		"add_checklist_item",
		{
			checklistId: z.string().min(1),
			name: z.string().min(1),
			position: z.string().optional().default("bottom"),
		},
		async ({ checklistId, name, position }) => ({
			content: [{ type: "text", text: JSON.stringify(await trelloClient.addChecklistItem(checklistId, name, position), null, 2) }],
		})
	);

	server.tool(
		"update_checklist_item",
		{
			cardId: z.string().min(1),
			itemId: z.string().min(1),
			state: z.enum(["complete", "incomplete"]),
		},
		async ({ cardId, itemId, state }) => {
			await trelloClient.updateChecklistItem(cardId, itemId, state);
			return { content: [{ type: "text", text: `Updated checklist item ${itemId} to ${state}` }] };
		}
	);

	server.tool("delete_checklist", { checklistId: z.string().min(1) }, async ({ checklistId }) => {
		await trelloClient.deleteChecklist(checklistId);
		return { content: [{ type: "text", text: `Deleted checklist ${checklistId}` }] };
	});
}
