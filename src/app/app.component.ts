import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy, Component,
  ViewEncapsulation,
} from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';

import { DecoderComponent, EncoderComponent, SpeechComponent } from './shared/components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [EncoderComponent, DecoderComponent, SpeechComponent, MatDividerModule, MatTabsModule, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent {
}
