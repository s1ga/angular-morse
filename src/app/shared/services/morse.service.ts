import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import {
  DOUBLE_SPACE, EMPTY_STRING, multipleSpacesRegexp, nonCharacterRegexp, nonMorseRegexp, SPACE, twoMoreSpacesRegexp,
} from '../constants';
import { MORSE } from '../tokens';

@Injectable({ providedIn: 'root' })
export class MorseService {
  private readonly twoMoreSpacesRegexp = twoMoreSpacesRegexp;
  private readonly multipleSpacesRegexp = multipleSpacesRegexp;
  private readonly nonMorseRegexp = nonMorseRegexp;
  private readonly nonCharacterRegexp = nonCharacterRegexp;
  private alphabet: Map<string, string> = inject(MORSE);
  private encodedValue$ = new Subject<string[]>();

  public value = this.encodedValue$.asObservable();

  public replaceEncodedText(text: string): string {
    return text
      .trimStart()
      .replace(this.twoMoreSpacesRegexp, SPACE)
      .replace(this.nonCharacterRegexp, EMPTY_STRING);
  }

  public replaceDecodedText(text: string): string {
    return text
      .trimStart()
      .replace(this.multipleSpacesRegexp, DOUBLE_SPACE)
      .replace(this.nonMorseRegexp, EMPTY_STRING);
  }

  public encodeText(text: string): string[] {
    const encodedArray = text.split(EMPTY_STRING).map(this.encodeChar.bind(this));
    this.encodedValue$.next(encodedArray);
    return encodedArray;
  }

  public decodeText(text: string): string {
    const chars = text.split(SPACE);
    const decoded = [];
    for (let i = 0; i < chars.length; i += 1) {
      const foundKey = this.decodeChar(chars[i]);
      if (!foundKey && chars[i] !== EMPTY_STRING) {
        return EMPTY_STRING;
      }
      decoded.push(foundKey ?? SPACE);
    }

    return decoded.join(EMPTY_STRING);
  }

  public encodeChar(c: string): string {
    return this.alphabet.get(c) ?? c;
  }

  public decodeChar(c: string): string | undefined {
    const keys = [...this.alphabet.keys()];
    return keys.find((k: string) => this.alphabet.get(k) === c);
  }
}
