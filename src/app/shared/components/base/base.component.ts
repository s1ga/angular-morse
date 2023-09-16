import { Directive, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Directive({
  standalone: true,
})
export class BaseComponent implements OnDestroy {
  protected subscriptions: Subscription[] = [];

  public ngOnDestroy(): void {
    this.subscriptions.forEach((sub: Subscription) => {
      sub?.unsubscribe();
    });
  }
}
