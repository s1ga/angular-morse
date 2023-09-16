import { NgFor } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, effect, inject, OnInit, signal,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map } from 'rxjs/operators';

import {
  DOUBLE_SPACE, EMPTY_STRING, multipleSpacesRegexp, SPACE,
} from '../../constants';
import { MorseService } from '../../services';
import { copyText } from '../../utils/copy-text';
import { BaseComponent } from '../base/base.component';

@Component({
  selector: 'app-encoder',
  standalone: true,
  imports: [
    NgFor, FormsModule, ReactiveFormsModule,
    MatButtonModule, MatFormFieldModule, MatInputModule,
  ],
  templateUrl: './encoder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncoderComponent extends BaseComponent implements OnInit {
  private morseService = inject(MorseService);
  protected encodedTextArray = signal<string[]>([]);
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
          map((val: string | null) => this.morseService.replaceEncodedText(val || EMPTY_STRING)),
        )
        .subscribe((val: string | null) => {
          this.textControl.setValue(val, { emitEvent: false, onlySelf: true });
        }),
    );
  }

  public toMorse(): void {
    const text = (this.textControl.value || EMPTY_STRING).trim().toLowerCase();
    const encoded = this.morseService.encodeText(text);
    this.encodedTextArray.set(encoded);
  }

  public clear(): void {
    this.textControl.setValue(EMPTY_STRING, { emitEvent: false, onlySelf: true });
    this.toMorse();
  }

  public setTextToCopy(): void {
    const text = this.encodedTextArray().join(SPACE).replace(multipleSpacesRegexp, DOUBLE_SPACE);
    this.textToCopy.set(text);
  }
}
