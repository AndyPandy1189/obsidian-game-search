import { App, PluginSettingTab, Setting, TFolder, TFile, FuzzySuggestModal } from 'obsidian';
import type GameSearchPlugin from './main';

export interface GameSearchPluginSettings {
	igdbClientId: string;
	igdbClientSecret: string;
	templatePath: string;
	destinationFolder: string;
}

export const DEFAULT_SETTINGS: GameSearchPluginSettings = {
	igdbClientId: '',
	igdbClientSecret: '',
	templatePath: '',
	destinationFolder: ''
}

class FileSuggestModal extends FuzzySuggestModal<TFile> {
	onChoose: (file: TFile) => void;

	constructor(app: App, onChoose: (file: TFile) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	getItems(): TFile[] {
		return this.app.vault.getMarkdownFiles();
	}

	getItemText(item: TFile): string {
		return item.path;
	}

	onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(item);
	}
}

class FolderSuggestModal extends FuzzySuggestModal<TFolder> {
	onChoose: (folder: TFolder) => void;

	constructor(app: App, onChoose: (folder: TFolder) => void) {
		super(app);
		this.onChoose = onChoose;
	}

	getItems(): TFolder[] {
		return this.app.vault.getAllLoadedFiles().filter((f): f is TFolder => f instanceof TFolder);
	}

	getItemText(item: TFolder): string {
		return item.path === '/' ? 'Vault Root' : item.path;
	}

	onChooseItem(item: TFolder, evt: MouseEvent | KeyboardEvent): void {
		this.onChoose(item);
	}
}

export class GameSearchSettingTab extends PluginSettingTab {
	plugin: GameSearchPlugin;

	constructor(app: App, plugin: GameSearchPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl).setName('IGDB API Settings').setHeading();

		new Setting(containerEl)
			.setName('IGDB Client ID')
			.setDesc('Your Twitch Developer Client ID')
			.addText(text => {
				text.inputEl.type = 'password';
				text.setPlaceholder('Enter your client ID')
					.setValue(this.plugin.settings.igdbClientId)
					.onChange(async (value) => {
						this.plugin.settings.igdbClientId = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('IGDB Client Secret')
			.setDesc('Your Twitch Developer Client Secret')
			.addText(text => {
				text.inputEl.type = 'password';
				text.setPlaceholder('Enter your client secret')
					.setValue(this.plugin.settings.igdbClientSecret)
					.onChange(async (value) => {
						this.plugin.settings.igdbClientSecret = value;
						await this.plugin.saveSettings();
					});
			});

		new Setting(containerEl).setName('File Settings').setHeading();

		new Setting(containerEl)
			.setName('Template File Path')
			.setDesc('Select the markdown file to use as a template')
			.addText(text => {
				text.setPlaceholder('Templates/GameTemplate.md')
					.setValue(this.plugin.settings.templatePath)
					.onChange((value) => {
						this.plugin.settings.templatePath = value;
						this.plugin.saveSettings();
					});
			})
			.addButton(btn => btn
				.setButtonText('Browse')
				.onClick(() => {
					new FileSuggestModal(this.app, (file: TFile) => {
						this.plugin.settings.templatePath = file.path;
						this.plugin.saveSettings();
						this.display();
					}).open();
				}));

		new Setting(containerEl)
			.setName('Destination Folder')
			.setDesc('Select the folder where new game notes will be created')
			.addText(text => {
				text.setPlaceholder('Games')
					.setValue(this.plugin.settings.destinationFolder)
					.onChange((value) => {
						this.plugin.settings.destinationFolder = value;
						this.plugin.saveSettings();
					});
			})
			.addButton(btn => btn
				.setButtonText('Browse')
				.onClick(() => {
					new FolderSuggestModal(this.app, (folder: TFolder) => {
						const path = folder.path === '/' ? '' : folder.path;
						this.plugin.settings.destinationFolder = path;
						this.plugin.saveSettings();
						this.display();
					}).open();
				}));
        
        new Setting(containerEl).setName('Template Variables Reference').setHeading();
        containerEl.createEl('p', {text: 'Use these tags in your template file to insert game data:'});
        const ul = containerEl.createEl('ul');
        ul.createEl('li', {text: '{{title}} - The name of the game'});
        ul.createEl('li', {text: '{{summary}} - Game description/summary'});
        ul.createEl('li', {text: '{{release_date}} - Initial release date (YYYY-MM-DD)'});
        ul.createEl('li', {text: '{{developer}} - Developer company name'});
        ul.createEl('li', {text: '{{publisher}} - Publisher company name'});
        ul.createEl('li', {text: '{{genres}} - Comma-separated list of genres'});
        ul.createEl('li', {text: '{{platforms}} - Comma-separated list of platforms'});
        ul.createEl('li', {text: '{{cover_image}} - URL to the cover image'});
        ul.createEl('li', {text: '{{rating}} - Average user rating (e.g. 85)'});
        ul.createEl('li', {text: '{{aggregated_rating}} - Average critic rating (e.g. 90)'});
        ul.createEl('li', {text: '{{storyline}} - Brief plot description'});
        ul.createEl('li', {text: '{{game_modes}} - Comma-separated list of game modes'});
        ul.createEl('li', {text: '{{themes}} - Comma-separated list of themes'});
        ul.createEl('li', {text: '{{franchise}} - The franchise or collection the game belongs to'});
        ul.createEl('li', {text: '{{url}} - IGDB URL for the game'});
        ul.createEl('li', {text: '{{screenshots}} - Comma-separated list of screenshot URLs'});
        ul.createEl('li', {text: '{{similar_games}} - Comma-separated list of similar games'});
	}
}
