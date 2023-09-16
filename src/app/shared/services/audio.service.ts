/* eslint-disable no-await-in-loop */
import { Injectable } from '@angular/core';
import {
  BehaviorSubject, fromEvent, Subject, Subscription,
} from 'rxjs';

import { DEFAULT_VOLUME, DOT, SPACE } from '../constants';
import { wait } from '../utils/wait';

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly frequency = 440;
  private readonly DOT_TIME = 100;
  private readonly SYMBOL_BREAK = this.DOT_TIME;
  private readonly DASH_TIME = this.DOT_TIME * 3;
  private readonly LETTER_BREAK = this.DOT_TIME * 3;
  private readonly WORD_BREAK = this.DOT_TIME * 7;
  private audioContext: AudioContext | null = null;
  private gain!: GainNode;
  private oscillator!: OscillatorNode;
  private currentVolume = DEFAULT_VOLUME;
  private subs: Subscription[] = [];

  private currentChar$ = new Subject<string>();
  private isPlaying$ = new BehaviorSubject<boolean>(false);

  public currentChar = this.currentChar$.asObservable();
  public isPlaying = this.isPlaying$.asObservable();

  private createContext(): AudioContext {
    const audioContext = new AudioContext();
    this.oscillator = audioContext.createOscillator();
    this.gain = audioContext.createGain();
    this.gain.gain.value = this.currentVolume; //
    this.oscillator.frequency.value = this.frequency;
    this.oscillator.connect(this.gain);
    this.gain.connect(audioContext.destination);
    this.oscillator.start(0);
    return audioContext;
  }

  public async play(morse: string[]): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = this.createContext();
      this.removeSubs();
      this.initSubs();
    }

    await this.init(this.audioContext.currentTime, morse);
    this.oscillator.stop(0);
  }

  public async stop(): Promise<void> {
    if (!this.audioContext) return;
    try {
      this.gain.disconnect();
      this.oscillator.disconnect();
      await this.audioContext.close();
      this.audioContext = null;
    } catch (err: unknown) {
      console.error(err);
    }
  }

  public setVolume(volume: number): void {
    if (!this.gain) return;
    this.currentVolume = volume / 100;
    this.gain.gain.value = this.currentVolume;
  }

  private async init(startTime: number, morse: string[]) {
    // let time: number = startTime;
    // morse.forEach((c: string) => {
    //   this.currentChar$.next(c);
    //   if (c === SPACE) {
    //     time += this.WORD_BREAK;
    //   } else {
    //     time = this.createSound(time, c);
    //     time += this.LETTER_BREAK;
    //   }
    // });
    // this.oscillator.stop(time);
    await wait(this.LETTER_BREAK);
    for (let i = 0; i < morse.length; i += 1) {
      const c = morse[i];
      this.currentChar$.next(c);
      if (c === SPACE) {
        await wait(this.WORD_BREAK);
      } else {
        await this.createSound(0, c);
        await wait(this.LETTER_BREAK);
      }
    }
  }

  private async createSound(startTime: number, char: string) {
    // const soundTime: number = startTime;
    for (let i = 0; i < char.length; i += 1) {
      // this.gain.gain.setValueAtTime(this.currentVolume, soundTime); //
      // soundTime += (char[i] === '.') ? this.DOT_TIME : this.DASH_TIME;
      // this.gain.gain.setValueAtTime(0.0, soundTime);
      // soundTime += this.SYMBOL_BREAK;

      this.gain.gain.setTargetAtTime(this.currentVolume, 0, 0.001);
      await wait(char[i] === DOT ? this.DOT_TIME : this.DASH_TIME);
      this.gain.gain.setTargetAtTime(0, 0, 0.001);
      await wait(this.SYMBOL_BREAK);
    }

    // return soundTime;
  }

  private initSubs(): void {
    this.subs.push(
      fromEvent(this.audioContext!, 'statechange')
        .subscribe((e: Event) => {
          const target = e.target as AudioContext;
          this.isPlaying$.next(target.state === 'running');
        }),
      fromEvent(this.oscillator, 'ended')
        .subscribe(() => this.stop()),
    );
  }

  private removeSubs(): void {
    this.subs.forEach((s: Subscription) => {
      s.unsubscribe();
    });
    this.subs = [];
  }
}
