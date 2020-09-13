import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Stock } from '../models/stock';
import { SotckProfile } from '../models/stock-profile';
import { StockCandles } from '../models/stock-candles';

@Injectable()
export class StocksService {

  private static readonly URL_STOCK = "https://finnhub.io/api/v1/stock/symbol?exchange=US"
  private static readonly URL_STOCK_CANDLES = "https://finnhub.io/api/v1/stock/candle"
  private static readonly URL_STOCK_COMPANY_INFO = "https://finnhub.io/api/v1/stock/profile2"

  constructor(private http: HttpClient) { }

  getStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>(StocksService.URL_STOCK);
  }

  getStockCandles(symbol: string, resolution: string | number, from_date: number, to_date: number): Observable<StockCandles> {
    const params = {
      symbol: symbol,
      resolution: resolution.toString(),
      from: from_date.toString(),
      to: to_date.toString() 
    };

    return this.http.get<StockCandles>(StocksService.URL_STOCK_CANDLES, {params: params});
  }

  getCompanyInfo(symbol: string): Observable<SotckProfile> {
    const params = {
      symbol: symbol,
    };

    return this.http.get<SotckProfile>(StocksService.URL_STOCK_COMPANY_INFO, {params: params});
  }


}
