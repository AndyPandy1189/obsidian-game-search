import { App, Modal, Setting } from 'obsidian';

export class ConflictResolutionModal extends Modal {
	currentName: string;
	newName: string;
	onSubmit: (newName: string) => void;

	constructor(app: App, currentName: string, onSubmit: (newName: string) => void) {
		super(app);
		this.currentName = currentName;
		this.newName = currentName;
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;
		
		contentEl.createEl('h2', { text: 'File Name Conflict' });
		contentEl.createEl('p', { text: `A file named "${this.currentName}.md" already exists. Please enter a new name to avoid overwriting.` });

		let textInput: HTMLInputElement;

		new Setting(contentEl)
			.setName('New Name')
			.addText(text => {
				textInput = text.inputEl;
				text.setValue(this.currentName)
					.onChange(value => {
						this.newName = value;
					});
			});

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText('Submit')
				.setCta()
				.onClick(() => {
					this.close();
					this.onSubmit(this.newName);
				}));

		// Handle enter key
		textInput!.addEventListener('keydown', (e) => {
			if (e.key === 'Enter') {
				e.preventDefault();
				this.close();
				this.onSubmit(this.newName);
			}
		});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
