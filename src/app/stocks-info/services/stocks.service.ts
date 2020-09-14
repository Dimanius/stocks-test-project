import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, Subscription } from 'rxjs';
import { Stock } from '../models/stock';
import { SotckProfile } from '../models/stock-profile';
import { StockCandles } from '../models/stock-candles';
import { WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';

const MESSAGE_TYPE_TRADE = "trade";

@Injectable()
export class StocksService {

  public stocktradesSubject$ = new Subject();
  
  private readonly URL_STOCK = "https://finnhub.io/api/v1/stock/symbol?exchange=US";
  private readonly URL_STOCK_CANDLES = "https://finnhub.io/api/v1/stock/candle";
  private readonly URL_STOCK_COMPANY_INFO = "https://finnhub.io/api/v1/stock/profile2";
  private readonly URL_WS = "wss://ws.finnhub.io?token=";  
  
  private websocket$: WebSocketSubject<any>;
  private currentSymbol: string = null;


  constructor(private http: HttpClient) {

    this.websocket$ = new WebSocketSubject(this.URL_WS + environment.token);
    
    this.websocket$.asObservable().subscribe(
      (message) => { 
        if (message.type === MESSAGE_TYPE_TRADE) {
          this.stocktradesSubject$.next(message.data); 
        }
      },
      (err) => { console.log(err); }
    )
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

  getSymbolStockTrades(symbol: string): void {
    const subscribeMessage = {
      type: "subscribe",
      symbol: symbol,
    }

    const unsubscribeMessage = {
      type: "unsubscribe",
      symbol: this.currentSymbol,
    }

    if (!this.currentSymbol) {
      this.websocket$.next(subscribeMessage)
    } else {
      this.websocket$.next(unsubscribeMessage)
      this.websocket$.next(subscribeMessage)
    }
    this.currentSymbol = symbol;
  }

}
