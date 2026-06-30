import { App, SuggestModal, Notice } from 'obsidian';
import { IGDBClient, IGDBGame } from './api';
import { renderAndCreateNote } from './templateRenderer';
import type GameSearchPlugin from './main';

export class GameSearchModal extends SuggestModal<IGDBGame> {
	plugin: GameSearchPlugin;
	igdbClient: IGDBClient;

	constructor(app: App, plugin: GameSearchPlugin) {
		super(app);
		this.plugin = plugin;
		this.igdbClient = new IGDBClient(plugin.settings.igdbClientId, plugin.settings.igdbClientSecret);
		this.setPlaceholder('Search for a game...');
	}

	async getSuggestions(query: string): Promise<IGDBGame[]> {
		if (query.length < 3) return [];
		
		try {
			return await this.igdbClient.searchGames(query);
		} catch (_) {
			new Notice("Failed to search IGDB. Please check your API credentials in settings.");
			return [];
		}
	}

	renderSuggestion(game: IGDBGame, el: HTMLElement) {
		el.createEl('div', { text: game.name });
		
		let subtitle = '';
		if (game.first_release_date) {
			subtitle += new Date(game.first_release_date * 1000).getFullYear();
		}
		
		if (game.involved_companies) {
			const dev = game.involved_companies.find(c => c.developer);
			if (dev) {
				subtitle += subtitle ? ` - ${dev.company.name}` : dev.company.name;
			}
		}

		if (subtitle) {
			el.createEl('small', { text: subtitle, cls: 'game-search-subtitle' });
		}
	}

	onChooseSuggestion(game: IGDBGame, evt: MouseEvent | KeyboardEvent) {
		new Notice(`Selected ${game.name}. Creating note...`);
		void renderAndCreateNote(this.app, game, this.plugin.settings.templatePath, this.plugin.settings.destinationFolder);
	}
}
