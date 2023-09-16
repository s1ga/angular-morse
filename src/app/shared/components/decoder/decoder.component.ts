import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, effect, inject, OnInit, signal,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { map } from 'rxjs/operators';

import { EMPTY_STRING } from '../../constants';
import { MorseService } from '../../services';
import { copyText } from '../../utils/copy-text';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-decoder',
  standalone: true,
  imports: [
    NgFor, FormsModule, ReactiveFormsModule, MatTooltipModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
  ],
  templateUrl: './decoder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DecoderComponent extends BaseComponent implements OnInit {
  private morseService = inject(MorseService);
  protected decodedText = signal<string>(EMPTY_STRING);
  protected textToCopy = signal<string>(EMPTY_STRING);
  protected textControl = new FormControl<string>(EMPTY_STRING);

  constructor() {
    super();

    effect(() => {
      const text = this.textToCopy();
      if (!text) return;
      copyText(text);
    });
  }

  public ngOnInit(): void {
    this.subscriptions.push(
      this.textControl.valueChanges
        .pipe(
          map((val: string | null) => this.morseService.replaceDecodedText(val || EMPTY_STRING)),
        )
        .subscribe((val: string) => {
          this.textControl.setValue(val, { emitEvent: false, onlySelf: true });
        }),
    );
  }

  public fromMorse(): void {
    const text = (this.textControl.value || EMPTY_STRING).trim();
    const decoded = this.morseService.decodeText(text);
    this.decodedText.set(decoded);
  }

  public clear(): void {
    this.textControl.setValue(EMPTY_STRING);
    this.decodedText.set(EMPTY_STRING);
  }
}
