import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
  untracked
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApplicationStore } from '@shared/data';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DialogModule } from '@openng/optimus-ui/dialog';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { TooltipModule } from '@openng/optimus-ui/tooltip';
import {
  AI_PRESETS,
  AiProvider,
  MarketDataSettings
} from '../../data/market-data/market-data.types';
import { MarketDataService } from '../../data/market-data/market-data.service';

@Component({
  selector: 'sxe-app-settings',
  imports: [
    FormsModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    InputTextModule
  ],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppSettingsComponent {
  private readonly app = inject(ApplicationStore);
  private readonly marketData = inject(MarketDataService);
  openDialog = signal(false);
  busy = signal(false);
  message = signal('');
  source: MarketDataSettings['source'] = 'ai';
  provider: AiProvider = 'openai';
  consent = false;
  apiKey = '';
  scraperKey = '';
  readonly presets = AI_PRESETS;
  readonly sessionConfigured = this.app.canUseMarketData;

  constructor() {
    effect(() => {
      const open = this.openDialog();
      // Initialize the draft only when opening/closing, not whenever saving
      // changes store signals while an async settings operation is in flight.
      untracked(() => {
        if (open) {
          const settings = this.app.marketData();
          this.source = settings.source;
          this.provider = settings.provider;
          this.consent = settings.consent;
          this.scraperKey = this.app.apiKey() ?? '';
          this.apiKey = '';
          this.message.set('');
        } else {
          this.apiKey = '';
          this.scraperKey = '';
        }
      });
    });
  }

  onProviderChange(): void {
    this.apiKey = '';
    this.message.set('');
  }

  async onSaveSettings(close = true): Promise<boolean> {
    this.busy.set(true);
    this.message.set('');
    const settings: MarketDataSettings = {
      version: 1,
      source: this.source,
      provider: this.provider,
      consent: this.source === 'ai' && this.consent
    };
    const sessionKey = this.apiKey;
    const scraperKey = this.scraperKey.trim();
    try {
      if (
        settings.source === 'ai' &&
        !this.presets[settings.provider].available
      )
        throw new Error(
          'Kilo hosted search is not verified. Select another provider.'
        );
      if (settings.source === 'stoxscraper')
        await this.app.setApiKey(scraperKey);
      await this.app.setMarketDataSettings(settings, sessionKey);
      this.apiKey = '';
      if (close) this.openDialog.set(false);
      return true;
    } catch (error) {
      this.message.set(
        error instanceof Error ? error.message : 'Unable to save settings.'
      );
      return false;
    } finally {
      this.busy.set(false);
    }
  }

  async onTestConnection(): Promise<void> {
    if (!(await this.onSaveSettings(false))) return;
    this.busy.set(true);
    try {
      if (!this.app.canUseMarketData())
        throw new Error(
          'Add a session API key and enable consent before testing AI.'
        );
      const result = await this.marketData.searchSymbols('Apple');
      if (!result.length)
        throw new Error(
          'Connected, but no sourced search result was accepted.'
        );
      this.message.set(
        'Connection and sourced symbol search succeeded. Quote accuracy is not independently certified.'
      );
    } catch (error) {
      this.message.set(
        error instanceof Error ? error.message : 'Connection test failed.'
      );
    } finally {
      this.busy.set(false);
    }
  }

  forgetKey(): void {
    this.app.clearAiKey();
    this.apiKey = '';
    this.message.set('Session AI key cleared.');
  }
}
