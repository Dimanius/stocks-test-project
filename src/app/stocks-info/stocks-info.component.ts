import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { StocksService } from './services/stocks.service';
import { StockCandlesStatusEnum } from './enums/stock-candles-status.enum';

@Component({
  selector: 'app-test-stocks-info',
  templateUrl: './stocks-info.component.html',
  styleUrls: ['./stocks-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StocksInfoComponent implements OnInit {

  public readonly resolutions = [1, 5, 15, 30, 60, "D", "W", "M" ];

  public stocks = {
    items: [],
    profiles: [],
    profilesDataSourceStorage: []
  }
  public selectedStock: string = null;
  
  public stockCandlesFilters: any;
  public stockCandlesList: any = [];

  constructor(
    private stocksService: StocksService, 
    private changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.stockCandlesFilters = {
      dateFrom: Date.now(),
      dateTo: Date.now(),
      selectedResolution: this.resolutions[0]
    };

    this.stocksService.getStocks()
      .subscribe((stocks) => {
        this.stocks.items = stocks;
        this.changeDetectionRef.detectChanges();
      });
  }

  customizeTooltip(arg): {text: string} {
    return {
        text: "Open: $" + arg.openValue.toFixed(2) + "<br/>" +
            "Close: $" + arg.closeValue.toFixed(2) + "<br/>" +
            "High: $" + arg.highValue.toFixed(2) + "<br/>" +
            "Low: $" + arg.lowValue.toFixed(2) + "<br/>"
    };
  }

  getStockCandles(): void {
    if (this.selectedStock) {
      this.stocksService.getStockCandles(
          this.selectedStock, 
          this.stockCandlesFilters.selectedResolution, 
          Math.floor(this.stockCandlesFilters.dateFrom / 1000), 
          Math.floor(this.stockCandlesFilters.dateTo / 1000)
        )
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
          this.changeDetectionRef.detectChanges();
      })
    }
  }

  changeResolutionValue(e: any): void {
    this.stockCandlesFilters.selectedResolution = e.addedItems[0];
    this.getStockCandles();
  }

  onDateChanged(): void {
    this.getStockCandles();
  }

  onStockChanged(e: any): void {
    const rowData = e.selectedRowsData[0];
      if (rowData) {
          this.selectedStock = rowData.symbol;
          this.getStockCandles();
      }
  }

}
