import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { StocksService } from './services/stocks.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil, take, delay } from 'rxjs/operators';
import { StockCandlesStatusEnum } from './enums/stock-candles-status.enum';

@Component({
  selector: 'app-test-stocks-info',
  templateUrl: './stocks-info.component.html',
  styleUrls: ['./stocks-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StocksInfoComponent implements OnInit, OnDestroy {

  public readonly resolutions = [1, 5, 15, 30, 60, "D", "W", "M" ];

  public stocks = {
    items: [],
    profiles: []
  }
  public selectedStock: string = null;
  
  public stockCandlesFilters: any;
  public stockCandlesList: any = [];

  private _destroy: ReplaySubject<any> = new ReplaySubject<any>(1);

  constructor(
    private _stocksService: StocksService, 
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.stockCandlesFilters = {
      dateFrom: Date.now(),
      dateTo: Date.now(),
      selectedResolution: this.resolutions[0]
    };

    this._stocksService.getStocks()
      .pipe(takeUntil(this._destroy))
      .subscribe((stocks) => {
        this.stocks.items = stocks;
        this._changeDetectionRef.detectChanges();
    });
  }

  customizeTooltip(arg) {
    return {
        text: "Open: $" + arg.openValue + "<br/>" +
            "Close: $" + arg.closeValue + "<br/>" +
            "High: $" + arg.highValue + "<br/>" +
            "Low: $" + arg.lowValue + "<br/>"
    };
  }

  getStockCandles(): void {
    if (this.selectedStock) {
      this._stocksService.getStockCandles(
          this.selectedStock, 
          this.stockCandlesFilters.selectedResolution, 
          Math.floor(this.stockCandlesFilters.dateFrom / 1000), 
          Math.floor(this.stockCandlesFilters.dateTo / 1000)
        )
        .pipe(takeUntil(this._destroy))
        .subscribe((stocks_candles) => {
          if (stocks_candles['s'] === StockCandlesStatusEnum.Ok) {
            this.stockCandlesList = stocks_candles['l'].map((item, i) => {
              const obj = {
                l: stocks_candles['l'][i],
                h: stocks_candles['h'][i],
                o: stocks_candles['o'][i],
                c: stocks_candles['c'][i],
                date: new Date(stocks_candles['t'][i]*1000)
              }
              return obj;
            });
          } else {
            this.stockCandlesList = [];
          }
          this._changeDetectionRef.detectChanges();
      })
    }
  }

  getProfile(symbol: string) {
    // let item = this.tasksDataSourceStorage.find((i) => i.key === key);
    //     if (!item) {
    //         item = {
    //             key: key,
    //             dataSourceInstance: new DataSource({
    //                 store: new ArrayStore({
    //                     data: this.tasks,
    //                     key: "ID"
    //                 }),
    //                 filter: ["EmployeeID", "=", key]
    //             })
    //         };
    //         this.tasksDataSourceStorage.push(item)
    //     }
    //     return item.dataSourceInstance;
    // let item = this._stocksService.getCompanyInfo(symbol).toPromise();
    // console.log(item);
    return null;    
  }

  changeResolutionValue(e: any) {
    this.stockCandlesFilters.selectedResolution = e.addedItems[0];
    this.getStockCandles();
    this._changeDetectionRef.detectChanges();
  }

  onDateChanged() {
    this.getStockCandles();
  }

  onStockChanged(e: any): void {
    const rowData = e.selectedRowsData[0];
      if (rowData) {
          this.selectedStock = rowData.symbol;
          this.getStockCandles();
      }
  }

  ngOnDestroy(): void {
    this._destroy.next(null);
    this._destroy.complete();
  }

}
