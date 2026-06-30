import { App, Modal, Setting, Notice } from 'obsidian';
import { IGDBClient, IGDBGame } from './api';
import { renderAndCreateNote } from './templateRenderer';
import type GameSearchPlugin from './main';

export class BulkImportModal extends Modal {
	plugin: GameSearchPlugin;
	igdbClient: IGDBClient;
	stagedGames: IGDBGame[] = [];
	
	resultsContainer: HTMLElement;
	queueContainer: HTMLElement;
	searchInput: HTMLInputElement;

	constructor(app: App, plugin: GameSearchPlugin) {
		super(app);
		this.plugin = plugin;
		this.igdbClient = new IGDBClient(plugin.settings.igdbClientId, plugin.settings.igdbClientSecret);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('bulk-import-modal');

		contentEl.createEl('h2', { text: 'Bulk Import Games' });

		// Search Bar
		new Setting(contentEl)
			.setName('Search')
			.addText(text => {
				this.searchInput = text.inputEl;
				text.setPlaceholder('Enter game name...');
				text.inputEl.addEventListener('keydown', (e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						void this.performSearch(text.getValue());
					}
				});
			})
			.addButton(btn => btn
				.setButtonText('Search')
				.setCta()
				.onClick(() => {
					void this.performSearch(this.searchInput.value);
				}));

		// Layout Container
		const layoutContainer = contentEl.createDiv({ cls: 'bulk-import-layout', attr: { style: 'display: flex; gap: 20px; margin-top: 20px;' } });

		// Results Panel
		const resultsPanel = layoutContainer.createDiv({ attr: { style: 'flex: 1; border: 1px solid var(--background-modifier-border); padding: 10px; border-radius: 4px; max-height: 400px; overflow-y: auto;' } });
		resultsPanel.createEl('h3', { text: 'Search Results', attr: { style: 'margin-top: 0;' } });
		this.resultsContainer = resultsPanel.createDiv();

		// Queue Panel
		const queuePanel = layoutContainer.createDiv({ attr: { style: 'flex: 1; border: 1px solid var(--background-modifier-border); padding: 10px; border-radius: 4px; max-height: 400px; overflow-y: auto;' } });
		queuePanel.createEl('h3', { text: 'Staging Queue', attr: { style: 'margin-top: 0;' } });
		this.queueContainer = queuePanel.createDiv();

		// Action Bar
		const actionBar = contentEl.createDiv({ attr: { style: 'margin-top: 20px; text-align: right;' } });
		new Setting(actionBar)
			.addButton(btn => btn
				.setButtonText('Import All Staged Games')
				.setCta()
				.onClick(() => {
					void this.processQueue();
				}));

		this.renderQueue();
	}

	async performSearch(query: string) {
		if (query.length < 3) {
			new Notice("Search query must be at least 3 characters.");
			return;
		}

		this.resultsContainer.empty();
		this.resultsContainer.createEl('p', { text: 'Searching...' });

		try {
			const results = await this.igdbClient.searchGames(query);
			this.resultsContainer.empty();

			if (results.length === 0) {
				this.resultsContainer.createEl('p', { text: 'No results found.' });
				return;
			}

			results.forEach(game => {
				const gameEl = this.resultsContainer.createDiv({ attr: { style: 'display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid var(--background-modifier-border);' } });
				
				let subtitle = '';
				if (game.first_release_date) {
					subtitle = new Date(game.first_release_date * 1000).getFullYear().toString();
				}

				const titleEl = gameEl.createDiv();
				titleEl.createDiv({ text: game.name, attr: { style: 'font-weight: bold;' } });
				if (subtitle) {
					titleEl.createDiv({ text: subtitle, attr: { style: 'font-size: 0.8em; color: var(--text-muted);' } });
				}

				new Setting(gameEl)
					.addButton(btn => btn
						.setButtonText('Add')
						.onClick(() => {
							this.addToQueue(game);
						}));
			});

		} catch (_) {
			this.resultsContainer.empty();
			this.resultsContainer.createEl('p', { text: 'Error searching IGDB. Check credentials.' });
		}
	}

	addToQueue(game: IGDBGame) {
		if (this.stagedGames.find(g => g.id === game.id)) {
			new Notice("Game already in queue!");
			return;
		}
		this.stagedGames.push(game);
		this.renderQueue();
	}

	removeFromQueue(gameId: number) {
		this.stagedGames = this.stagedGames.filter(g => g.id !== gameId);
		this.renderQueue();
	}

	renderQueue() {
		this.queueContainer.empty();

		if (this.stagedGames.length === 0) {
			this.queueContainer.createEl('p', { text: 'Queue is empty.' });
			return;
		}

		this.stagedGames.forEach(game => {
			const gameEl = this.queueContainer.createDiv({ attr: { style: 'display: flex; justify-content: space-between; align-items: center; padding: 5px 0; border-bottom: 1px solid var(--background-modifier-border);' } });
			gameEl.createDiv({ text: game.name, attr: { style: 'font-weight: bold;' } });

			new Setting(gameEl)
				.addButton(btn => btn
					.setButtonText('Remove')
					.setDestructive()
					.onClick(() => {
						this.removeFromQueue(game.id);
					}));
		});
	}

	async processQueue() {
		if (this.stagedGames.length === 0) {
			new Notice("Queue is empty.");
			return;
		}

		this.close();

		for (const game of this.stagedGames) {
			await renderAndCreateNote(this.app, game, this.plugin.settings.templatePath, this.plugin.settings.destinationFolder, false);
		}

		new Notice(`Successfully processed ${this.stagedGames.length} games!`);
		this.stagedGames = [];
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
