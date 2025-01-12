import { Editor, MarkdownView, Command, Plugin, MenuItem } from 'obsidian';
import CustomMenuSettingsTab, { CustomMenuSettings, DEFAULT_SETTINGS } from './ui/settingsTab';
import { around } from 'monkey-around';

export default class CustomMenuPlugin extends Plugin {
	settings: CustomMenuSettings;

	async onload() {
		//Add Insert Command
		this.addCommand({
			id: "add-internal-link-using-selected-word-as-alias",
			name: "Add internal link using selected word as alias",
			editorCallback: this.insertInternalLinkWithAlias,
		});

		await this.loadSettings();
		this.addSettingTab(new CustomMenuSettingsTab(this.app, this));

		this.settings.menuCommands.forEach(command => {
			this.addMenuItem(command);
		});

		/* moneky-around doesn't know about my this.settings, need to set it here */
		let hideTitles = this.settings.hideTitles

		/* Hide menu items */
		/* https://github.com/Panossa/mindful-obsidian/blob/master/main.ts */
		this.register(around(MenuItem.prototype, {
			setTitle(old) {
				return function (title: string | DocumentFragment) {
					this.dom.dataset.stylizerTitle = String(title);

					if (hideTitles.includes(String(title))) {
						this.dom.addClass('le-menu-hide-item');
					}

					return old.call(this, title);
				};
			}
		}));
	}

	private insertInternalLinkWithAlias = (editor: Editor, view: MarkdownView) => {
		const selectedWord = editor.getSelection();
		const hasSelectedWord = selectedWord !== "";

		const linkText = hasSelectedWord ? `|${selectedWord}` : "";
		const cursorOffset = hasSelectedWord ? 3 + selectedWord.length : 2;

		this.replaceSelectionAndMoveCursor(editor, `[[${linkText}]]`, cursorOffset);
	};

	private replaceSelectionAndMoveCursor = (editor: Editor, text: string, cursorOffset: number) => {
		editor.replaceSelection(text);

		const cursorPosition = editor.getCursor();
		cursorPosition.ch -= cursorOffset;

		editor.setCursor(cursorPosition);
	};

	private addMenuItem(command: Command) {
		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu) => {
				menu.addItem((item) => {
					item.setTitle(command.name)
					.setIcon(command.icon)
					.onClick(() => {
						//@ts-ignore
						this.app.commands.executeCommandById(command.id);
					});
				});
			})
		);
	}

	//add command to the list of commands to be added to right-click menu (persistent, saved in settings)
	async addMenuItemSetting(command: Command, settingTab: CustomMenuSettingsTab) {
		this.addMenuItem(command);
		this.settings.menuCommands.push(command);
		await this.saveSettings();

		settingTab.display(); //refresh settings tab
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}