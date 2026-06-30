import { Plugin } from 'obsidian';
import { GameSearchSettingTab, DEFAULT_SETTINGS, GameSearchPluginSettings } from './settings';
import { GameSearchModal } from './GameSearchModal';
import { BulkImportModal } from './BulkImportModal';

export default class GameSearchPlugin extends Plugin {
	settings: GameSearchPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'fetch-igdb-game',
			name: 'Single Import',
			callback: () => {
				new GameSearchModal(this.app, this).open();
			}
		});

		this.addCommand({
			id: 'bulk-fetch-igdb-games',
			name: 'Bulk Import',
			callback: () => {
				new BulkImportModal(this.app, this).open();
			}
		});

		// Add an icon to the ribbon
		this.addRibbonIcon('gamepad-2', 'Single Import', (evt: MouseEvent) => {
			new GameSearchModal(this.app, this).open();
		});

		this.addSettingTab(new GameSearchSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, (await this.loadData()) as Partial<GameSearchPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
