import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {APP_BASE_HREF} from '@angular/common';
import { FolderComponent } from './folder/folder.component';
import {MatTreeModule, MatInputModule, MatFormFieldModule, MatIconModule} from '@angular/material';
import {MatCheckboxModule} from '@angular/material';
import { FileComponent } from './file/file.component'

@NgModule({
  declarations: [
    AppComponent,
    FolderComponent,
    FileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatTreeModule,
    MatCheckboxModule,
     MatFormFieldModule,
    MatInputModule,    MatIconModule,
  ],
  providers: [{provide: APP_BASE_HREF, useValue: '/'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
