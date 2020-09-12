import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DxDataGridModule, DxChartModule, DxDateBoxModule, DxDropDownBoxModule, DxListModule, DxLoadIndicatorModule } from 'devextreme-angular';
import { AppComponent } from './app.component';
import { StocksInfoComponent } from './stocks-info/stocks-info.component';
import { AuthFinnhubInterceptor } from './auth-finnhub.interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { StocksService } from './stocks-info/services/stocks.service';
import { StockCandlesStatusEnum } from './stocks-info/enums/stock-candles-status.enum';
import { MasterDetailComponent } from './stocks-info/components/master-detail/master-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    StocksInfoComponent,
    MasterDetailComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule, 
    DxDataGridModule,
    DxChartModule,
    DxDateBoxModule,
    DxDropDownBoxModule,
    DxListModule,
    DxLoadIndicatorModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthFinnhubInterceptor, multi: true },
    StocksService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
