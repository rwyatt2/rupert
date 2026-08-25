import { evaluateIdea, toMarkdown } from "@rupert/core/node";
import { makeEvidenceGatherer } from "@rupert/mcp-client";
import { App, Notice, Plugin, PluginSettingTab, Setting } from "obsidian";
import { parseIdeaNote } from "./parseNote";
import {
  DEFAULT_PLUGIN_SETTINGS,
  toProviderSettings,
  type RupertPluginSettings,
} from "./settings";
import { DEFAULT_MODELS, type AIProvider } from "@rupert/core";

export default class RupertPlugin extends Plugin {
  settings: RupertPluginSettings = DEFAULT_PLUGIN_SETTINGS;

  async onload() {
    this.settings = Object.assign({}, DEFAULT_PLUGIN_SETTINGS, await this.loadData());

    this.addCommand({
      id: "rupert-stress-test",
      name: "Stress-test this note",
      callback: () => void this.stressTestActiveNote(),
    });

    this.addSettingTab(new RupertSettingTab(this.app, this));
  }

  async stressTestActiveNote() {
    const file = this.app.workspace.getActiveFile();
    if (!file) {
      new Notice("Open an idea note first.");
      return;
    }
    const content = await this.app.vault.read(file);
    const idea = parseIdeaNote(file.basename, content);
    new Notice(`Rupert: stress-testing ${idea.name}...`);
    try {
      const report = await evaluateIdea({
        idea,
        settings: toProviderSettings(this.settings),
        persist: true,
        gatherEvidence: makeEvidenceGatherer(this.settings.useMcpEvidence),
      });
      const md = toMarkdown(report);
      const folder = "Evaluations";
      if (!(await this.app.vault.adapter.exists(folder))) {
        await this.app.vault.createFolder(folder);
      }
      const date = report.timestamp.slice(0, 10);
      const safe = idea.name.replace(/[^\w.-]+/g, "-");
      const path = `${folder}/${safe}-${date}.md`;
      if (await this.app.vault.adapter.exists(path)) {
        await this.app.vault.adapter.write(path, md);
      } else {
        await this.app.vault.create(path, md);
      }
      new Notice(`Rupert: ${report.verdict} ${report.compositeScore}/100 → ${path}`);
    } catch (error) {
      new Notice(`Rupert failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class RupertSettingTab extends PluginSettingTab {
  plugin: RupertPlugin;

  constructor(app: App, plugin: RupertPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Rupert Viability Engine" });

    new Setting(containerEl)
      .setName("Provider")
      .addDropdown((dropdown) => {
        for (const provider of Object.keys(DEFAULT_MODELS) as AIProvider[]) {
          dropdown.addOption(provider, provider);
        }
        dropdown.setValue(this.plugin.settings.provider);
        dropdown.onChange(async (value) => {
          this.plugin.settings.provider = value as AIProvider;
          this.plugin.settings.model = DEFAULT_MODELS[value as AIProvider];
          await this.plugin.saveSettings();
          this.display();
        });
      });

    new Setting(containerEl)
      .setName("API key")
      .setDesc("Stored in this vault's plugin data. Not uploaded.")
      .addText((text) => {
        text.inputEl.type = "password";
        text.setValue(this.plugin.settings.apiKey);
        text.onChange(async (value) => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Model")
      .addText((text) => {
        text.setValue(this.plugin.settings.model);
        text.onChange(async (value) => {
          this.plugin.settings.model = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Ollama / custom base URL")
      .addText((text) => {
        text.setPlaceholder("http://127.0.0.1:11434");
        text.setValue(this.plugin.settings.customBaseUrl);
        text.onChange(async (value) => {
          this.plugin.settings.customBaseUrl = value;
          await this.plugin.saveSettings();
        });
      });

    new Setting(containerEl)
      .setName("Use MCP evidence")
      .setDesc("Optional. Queries ~/.rupert/mcp.json before scoring.")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.useMcpEvidence);
        toggle.onChange(async (value) => {
          this.plugin.settings.useMcpEvidence = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
