import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { IonicStorageModule } from "@ionic/storage";

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

// Services
import { ProfileService } from './services/profile.service';

// Components
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    IonicStorageModule.forRoot({
      name: "__utw",
      driverOrder: ["sqlite", "indexeddb", "websql"]
    }),
    LoggerModule.forRoot({
      level: NgxLoggerLevel.TRACE
    })
  ],
  providers: [
    StatusBar,
    SplashScreen,
    ProfileService,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
