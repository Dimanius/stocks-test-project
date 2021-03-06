import { Injectable, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';
import { Stock } from '../models/stock';
import { SotckProfile } from '../models/stock-profile';
import { StockCandles } from '../models/stock-candles';
import { WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { IWsMessage } from './interfaces/websocket.interfaces';
import { StockTrade } from '../models/stock-trade';

const MESSAGE_TYPE_TRADE = "trade";

@Injectable()
export class StocksService implements OnDestroy {

  private readonly URL_STOCK = "https://finnhub.io/api/v1/stock/symbol?exchange=US";
  private readonly URL_STOCK_CANDLES = "https://finnhub.io/api/v1/stock/candle";
  private readonly URL_STOCK_COMPANY_INFO = "https://finnhub.io/api/v1/stock/profile2";
  
  private websocket$: WebSocketSubject<IWsMessage>;
  private websocketMessages: Subscription;
  private stocktradesSubject$ = new Subject<StockTrade[]>();
  private currentSymbol: string = null;

  constructor(private http: HttpClient) {
    this.websocket$ = new WebSocketSubject(environment.socketUrl + `?token=${environment.token}`);
    this.websocketMessages = this.websocket$.asObservable().subscribe(
      (message) => { 
        if (message.type === MESSAGE_TYPE_TRADE) {
          this.stocktradesSubject$.next(message.data); 
        }
      },
      (err) => { console.log(err); }
    );
  }

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(this.URL_STOCK);
  }

  getStockCandles(symbol: string, resolution: string | number, from_date: number, to_date: number): Observable<StockCandles> {
    const params = {
      symbol: symbol,
      resolution: resolution.toString(),
      from: from_date.toString(),
      to: to_date.toString() 
    };

    return this.http.get<StockCandles>(this.URL_STOCK_CANDLES, {params: params});
  }

  getCompanyInfo(symbol: string): Observable<SotckProfile> {
    const params = {
      symbol: symbol,
    };

    return this.http.get<SotckProfile>(this.URL_STOCK_COMPANY_INFO, {params: params});
  }

  setSymbolStockTrades(symbol: string): void {
    const subscribeMessage = {
      type: "subscribe",
      symbol: symbol,
    };

    if (!this.currentSymbol) {
      this.websocket$.next(subscribeMessage);
    } else {
      const unsubscribeMessage = {
        type: "unsubscribe",
        symbol: this.currentSymbol,
      };

      this.websocket$.next(unsubscribeMessage);
      this.websocket$.next(subscribeMessage);
    }
    this.currentSymbol = symbol;
  }

  getStocktrades(): Observable<StockTrade[]> {
    return this.stocktradesSubject$.asObservable();
  }

  ngOnDestroy(): void {
    this.websocketMessages.unsubscribe();
  }

}
