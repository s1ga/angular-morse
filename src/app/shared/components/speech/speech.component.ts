import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, inject,
  OnInit,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DEFAULT_VOLUME, EMPTY_STRING } from '../../constants';
import { AudioService, MorseService } from '../../services';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-speech',
  standalone: true,
  imports: [MatTooltipModule, FormsModule, MatSliderModule, NgIf],
  templateUrl: './speech.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpeechComponent extends BaseComponent implements OnInit {
  private readonly defaultVolume = DEFAULT_VOLUME * 100;
  private morseService = inject(MorseService);
  private audioService = inject(AudioService);
  protected isPlaying = toSignal<boolean>(this.audioService.isPlaying);
  protected text = toSignal<string[]>(this.morseService.value);
  protected currentChar = signal<string>(EMPTY_STRING);
  protected volume = this.defaultVolume;

  public ngOnInit(): void {
    this.subscriptions.push(
      this.audioService.currentChar.subscribe((char: string) => {
        const decoded = this.morseService.decodeChar(char);
        this.currentChar.set(
          decoded ? `${decoded.toUpperCase()} = ${char}` : 'SPACE BETWEEN WORDS',
        );
      }),
    );
  }

  public playAudio(): void {
    const text = this.text();
    if (!text) return;
    this.audioService.play(text);
  }

  public toggleMute(): void {
    this.onVolumeChange(this.volume === 0 ? this.defaultVolume : 0);
  }

  public onVolumeChange(volume: number) {
    this.volume = volume;
    this.audioService.setVolume(volume);
  }
}
