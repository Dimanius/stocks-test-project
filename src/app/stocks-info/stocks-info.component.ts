import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { StocksService } from './services/stocks.service';
import { StockCandlesStatusEnum } from './enums/stock-candles-status.enum';
import { Stock } from './models/stock';
import { StockRealtime } from './models/stock-realtime';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-test-stocks-info',
  templateUrl: './stocks-info.component.html',
  styleUrls: ['./stocks-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StocksInfoComponent implements OnInit, OnDestroy {

  public readonly resolutions: { key: string, value: (string | number) }[] = [{
    key: "1 minute",
    value: 1
  },{
    key: "5 minutes",
    value: 5
  },{
    key: "15 minutes",
    value: 15
  },{
    key: "30 minutes",
    value: 30
  },{
    key: "60 minutes",
    value: 60
  },{
    key: "Day",
    value: "D"
  },{
    key: "Week",
    value: "W"
  },{
    key: "Month",
    value: "M"
  }];

  public stocks: Stock[] = [];
  public selectedStockSymbol: string = "None";
  public stockCandlesList: ChartStockCandle[] = [];
  public stockCandlesFilters: any;
  public stockRealtimeList: TradeStockRealtime[] = [];
  public stockRealtime$: Subscription;

  constructor(
    private stocksService: StocksService, 
    private changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.stockCandlesFilters = {
      dateFrom: Date.now(),
      dateTo: Date.now(),
      selectedResolution: this.resolutions[5].value
    };

    this.stocksService.getStocks()
      .subscribe((stocks) => {
        this.stocks = stocks;
        this.changeDetectionRef.detectChanges();
      });

    this.stockRealtime$ = this.stocksService.stocktradesSubject$
      .asObservable()
      .subscribe((data: StockRealtime[]) => {
        this.stockRealtimeList = data.reverse()
          .map((item) => {
            const gridStockRealtime: TradeStockRealtime = {
              symbol: item.s,
              price: item.p,
              date: new Date(item.t),
              value: item.v 
            };

            return gridStockRealtime;
          }).concat(this.stockRealtimeList);
        this.changeDetectionRef.detectChanges();
      });
  }

  customizeTooltip(arg: any): {text: string} {
    return {
        text: "Open: $" + arg.openValue.toFixed(2) + "<br/>" +
            "Close: $" + arg.closeValue.toFixed(2) + "<br/>" +
            "High: $" + arg.highValue.toFixed(2) + "<br/>" +
            "Low: $" + arg.lowValue.toFixed(2) + "<br/>"
    };
  }

  updateStockCandles(): void {
    if (this.selectedStockSymbol) {
      this.stocksService.getStockCandles(
          this.selectedStockSymbol, 
          this.stockCandlesFilters.selectedResolution, 
          Math.floor(this.stockCandlesFilters.dateFrom / 1000), 
          Math.floor(this.stockCandlesFilters.dateTo / 1000)
        )
        .subscribe((stocks_candles) => {
          if (stocks_candles.s === StockCandlesStatusEnum.Ok) {
            this.stockCandlesList = stocks_candles.l.map((item, i) => {
              const chartStockCandle: ChartStockCandle = {
                l: stocks_candles.l[i],
                h: stocks_candles.h[i],
                o: stocks_candles.o[i],
                c: stocks_candles.c[i],
                date: new Date(stocks_candles.t[i]*1000)
              }
              return chartStockCandle;
            });
          } else {
            this.stockCandlesList = [];
          }
          this.changeDetectionRef.detectChanges();
      })
    }
  }

  onResolutionChanged(e: any): void {
    this.stockCandlesFilters.selectedResolution = e.selectedItem.value;
    this.updateStockCandles();
  }

  onDateChanged(): void {
    this.updateStockCandles();
  }

  onStockChanged(e: any): void {
    const rowData = e.selectedRowsData[0];
      if (rowData) {
          this.selectedStockSymbol = rowData.symbol;
          this.updateStockCandles();
          this.updateRealtimeStockTrades();
      }
  }

  updateRealtimeStockTrades(): void {
    this.stockRealtimeList = [];
    this.stocksService.getSymbolStockTrades(this.selectedStockSymbol);
  }

  ngOnDestroy() {
    this.stockRealtime$.unsubscribe();
  }
}

class ChartStockCandle {
  l: number;
  h: number;
  o: number;
  c: number;
  date: Date
}

class TradeStockRealtime {
  symbol: string;
  price: number;
  date: Date;
  value: number;
}
