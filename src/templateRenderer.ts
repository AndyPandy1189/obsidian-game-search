import { App, Notice, TFile } from 'obsidian';
import type { IGDBGame } from './api';
import { ConflictResolutionModal } from './ConflictResolutionModal';

export async function renderAndCreateNote(app: App, game: IGDBGame, templatePath: string, destinationFolder: string, openAfterCreate: boolean = true) {
	if (!templatePath) {
		new Notice("Template path is not configured in settings.");
		return;
	}

	const templateFile = app.vault.getAbstractFileByPath(templatePath);
	if (!templateFile || !(templateFile instanceof TFile)) {
		new Notice(`Template file not found at ${templatePath}`);
		return;
	}

	let templateContent = await app.vault.read(templateFile);

	// Parse IGDB Game data into variables
	const title = game.name || '';
	const summary = game.summary || '';
	const release_date = game.first_release_date ? new Date(game.first_release_date * 1000).toISOString().split('T')[0] : '';
	
	let developer = '';
	let publisher = '';
	if (game.involved_companies) {
		const dev = game.involved_companies.find(c => c.developer);
		if (dev) developer = dev.company.name;
		
		const pub = game.involved_companies.find(c => c.publisher);
		if (pub) publisher = pub.company.name;
	}

	const genres = game.genres ? game.genres.map(g => g.name).join(', ') : '';
	const platforms = game.platforms ? game.platforms.map(p => p.name).join(', ') : '';
	
	let cover_image = '';
	if (game.cover && game.cover.url) {
		cover_image = 'https:' + game.cover.url.replace('t_thumb', 't_cover_big');
	}

	const rating = game.rating ? Math.round(game.rating).toString() : '';
	const aggregated_rating = game.aggregated_rating ? Math.round(game.aggregated_rating).toString() : '';
	const storyline = game.storyline || '';
	const game_modes = game.game_modes ? game.game_modes.map(m => m.name).join(', ') : '';
	const themes = game.themes ? game.themes.map(t => t.name).join(', ') : '';
	let franchise = '';
	if (game.franchises && game.franchises.length > 0) {
		franchise = game.franchises.map(f => f.name).join(', ');
	} else if (game.collection) {
		franchise = game.collection.name;
	}
	const url = game.url || '';
	const screenshots = game.screenshots ? game.screenshots.map(s => 'https:' + s.url.replace('t_thumb', 't_1080p')).join(', ') : '';
	const similar_games = game.similar_games ? game.similar_games.map(s => s.name).join(', ') : '';

	// Replace variables
	templateContent = templateContent
		.replace(/{{title}}/gi, title)
		.replace(/{{summary}}/gi, summary)
		.replace(/{{release_date}}/gi, release_date)
		.replace(/{{developer}}/gi, developer)
		.replace(/{{publisher}}/gi, publisher)
		.replace(/{{genres}}/gi, genres)
		.replace(/{{platforms}}/gi, platforms)
		.replace(/{{cover_image}}/gi, cover_image)
		.replace(/{{rating}}/gi, rating)
		.replace(/{{aggregated_rating}}/gi, aggregated_rating)
		.replace(/{{storyline}}/gi, storyline)
		.replace(/{{game_modes}}/gi, game_modes)
		.replace(/{{themes}}/gi, themes)
		.replace(/{{franchise}}/gi, franchise)
		.replace(/{{url}}/gi, url)
		.replace(/{{screenshots}}/gi, screenshots)
		.replace(/{{similar_games}}/gi, similar_games);

	// Create file name
	const safeTitle = title.replace(/[\\/:"*?<>|]+/g, '').trim();
	const newFileName = `${safeTitle}.md`;

	let folderPath = destinationFolder.trim();
	if (folderPath && !folderPath.endsWith('/')) {
		folderPath += '/';
	}
	
	const targetPath = `${folderPath}${newFileName}`;

	await createNoteWithConflictCheck(app, targetPath, templateContent, folderPath, openAfterCreate);
}

async function createNoteWithConflictCheck(app: App, targetPath: string, content: string, folderPath: string, openAfterCreate: boolean): Promise<void> {
	return new Promise((resolve, reject) => {
		const existingFile = app.vault.getAbstractFileByPath(targetPath);
		if (existingFile) {
			const currentName = targetPath.substring(folderPath.length, targetPath.length - 3);
			new ConflictResolutionModal(app, currentName, (newName: string) => {
				const safeNewName = newName.replace(/[\\/:"*?<>|]+/g, '').trim();
				const newPath = `${folderPath}${safeNewName}.md`;
				createNoteWithConflictCheck(app, newPath, content, folderPath, openAfterCreate)
					.then(resolve)
					.catch(e => reject(e instanceof Error ? e : new Error(String(e))));
			}).open();
		} else {
			const runCreate = async () => {
				try {
					if (folderPath) {
						const folderPaths = folderPath.replace(/\/$/, '').split('/');
						let currentPath = '';
						for (const folder of folderPaths) {
							currentPath += (currentPath === '' ? '' : '/') + folder;
							const folderObj = app.vault.getAbstractFileByPath(currentPath);
							if (!folderObj) {
								await app.vault.createFolder(currentPath);
							}
						}
					}

					const newFile = await app.vault.create(targetPath, content);
					new Notice(`Created note: ${targetPath}`);
					
					if (openAfterCreate) {
						const leaf = app.workspace.getLeaf(false);
						if (leaf && newFile instanceof TFile) await leaf.openFile(newFile);
					}
					resolve();
				} catch (error) {
					console.error("Error creating note:", error);
					new Notice("Failed to create note. See console for details.");
					reject(error instanceof Error ? error : new Error(String(error)));
				}
			};
			void runCreate();
		}
	});
}
