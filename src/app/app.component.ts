import { Component, AfterViewInit } from '@angular/core';

import { defaults as defaultControls } from 'ol/control';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import ZoomToExtent from 'ol/control/ZoomToExtent';

import WKT from 'ol/format/WKT';
import { Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'my-mapp';
  map:Map;
  selectNode(event){
    let file=event;
    let fileReader = new FileReader();
    var namesplited= event.name.split('.');
    let fileType:string='';
    if(namesplited!==undefined){
        fileType=namesplited[1]
       
    }
    var rs=fileReader.readAsText(file)
    fileReader.onload=(e)=>{
       if(fileType==='wkt'){
        console.log(fileReader.result)
     
       }
       else{

       }
    }
    
  }
  selectFile(files){
    
    let fileReader = new FileReader();
    var rs=fileReader.readAsText(files[0])
    fileReader.onload = (e) => {
     console.log(fileReader.result);
     //polygon=fileReader.result;
    
    //var wkt = 'POLYGON((10.689 -25.092, 34.595 -20.170, 38.814 -35.639, 13.502 -39.155, 10.689 -25.092))';  
   var wkt='POLYGON((51.38274857733471 35.68822899880935,51.38034531805736 35.704400537717206,51.399056408145256 35.704400537717206,51.40798279974682 35.69073859048525,51.397339794375725 35.681536368344325,51.383606884219475 35.682930712656486,51.38274857733471 35.68822899880935))'
    // var wkt=  fileReader.result.toString()
    console.log(wkt)
      var format=new WKT();
      var feature=format.readFeature(wkt,{
      dataProjection: 'EPSG:4326',
      //  featureProjection: 'EPSG:3857'
      featureProjection: 'EPSG:3395'
      })
      
var vector = new VectorLayer({
  source: new VectorSource({
    features: [feature]
  })
});
var raster = new TileLayer({
  source: new OSM()
});

this.map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [2952104.0199, -3277504.823],
    zoom: 4
  })
});
      // this.map=new Map({
      //   target:'map',  
      //   layers:[new TileLayer({
      //     source:new XYZ({url:'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'})
      //   })],
      //   view: new View({
      //    center: [813079.7791264898, 5929220.284081122],
      //    zoom: 7
      //  }),
      //  controls: defaultControls().extend([
      //    new ZoomToExtent({
      //      extent: [
      //        813079.7791264898, 5929220.284081122,
      //        848966.9639063801, 5936863.986909639
      //      ]
      //    })
      //  ])
      // })
    };
  }
  ngAfterViewInit(){
     
  }
}
