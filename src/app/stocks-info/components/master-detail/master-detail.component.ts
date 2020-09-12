import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { StocksService } from '../../services/stocks.service';

@Component({
  selector: 'app-test-master-detail',
  templateUrl: './master-detail.component.html',
  styleUrls: ['./master-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MasterDetailComponent implements OnInit {

  @Input()
  public symbol: string = null;

  public profiles = [];
  public isLoading: boolean = false;

  constructor(
      private stocksService: StocksService,
      private changeDetectionRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.startRequest();
    this.stocksService.getCompanyInfo(this.symbol)
    .subscribe((item) => {
      if (!this.isEmptyObject(item)) {
        this.profiles.push(item);
      }
      this.completeRequest();
    }, (error: any) => {
      this.completeRequest();
    });
  }

  private startRequest(): void {
    this.isLoading = true;
    this.changeDetectionRef.detectChanges();
  }

  private completeRequest(): void {
    this.isLoading = false;
    this.changeDetectionRef.detectChanges();
  }

  private isEmptyObject(value): boolean {
    return Object.keys(value).length === 0 && value.constructor === Object;
  }
}
