import { FuzzySuggestModal, Command } from "obsidian";
import CustomMenuPlugin from "src/main";
import IconPicker from "./iconPicker";
import CustomMenuSettingsTab from "./settingsTab";


export default class CommandSuggester extends FuzzySuggestModal<Command> {
	settingTab: CustomMenuSettingsTab;
	plugin: CustomMenuPlugin;

	constructor(plugin: CustomMenuPlugin, settingTab: CustomMenuSettingsTab) {
		super(plugin.app);
		this.settingTab = settingTab;
		this.plugin = plugin;
	}

	getItems(): Command[] {
		//@ts-ignore
		return this.app.commands.listCommands();
	}

	getItemText(item: Command): string {
		return item.name;
	}

	onChooseItem(item: Command): void {
		if (item.icon) {
			this.plugin.addMenuItemSetting(item, this.settingTab);
		} else {
			new IconPicker(this, item).open()
		}
	}
}

