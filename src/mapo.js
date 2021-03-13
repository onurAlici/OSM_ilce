import 'ol/ol.css';
import Map from 'ol/Map';

import VectorSource from 'ol/source/Vector';
import View from 'ol/View';

import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';

import {transformExtent} from 'ol/proj';
import {fromLonLat, transform} from 'ol/proj';
import OSM from 'ol/source/OSM';

import userAction from "./data";
import React, { Component } from "react";
import Tablo from './table';
import Overlay from 'ol/Overlay';
import {toLonLat} from 'ol/proj';
import {toStringHDMS} from 'ol/coordinate';


class PublicMap extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.closer = this.closer.bind(this);
        this.overlayContent = this.overlayContent.bind(this);
        this.veri = [];
        this.overl = React.createRef();
        this.source = new VectorSource({
    
        });
        this.noktasource = new VectorSource({
    
        });
        this.state = { center: fromLonLat([28.979530,41.015137]), zoom: 12 , 
          data: false, 
          poligonlar: [],
          noktalar: [],
          sinir: [28.8059569, 40.9778498, 29.091700499999998, 41.10772969999999],
          filtre: "",
          overlay: false,
        };
        
      var vector = new VectorLayer({
          source: this.source,
          
          
        });
      let noktavector = new VectorLayer({
        source: this.noktasource,
        
        
      });
      this.overlay1 = undefined;
  
    
        this.olmap = new Map({
          target: null,
          layers: [
              new TileLayer({
                  source: new OSM()
                }),
                vector,
                noktavector
          ],
          view: new View({
            center: this.state.center,
            zoom: this.state.zoom
          })
        });
      }
    updateMap() {
        this.olmap.getView().setCenter(this.state.center);
        this.olmap.getView().setZoom(this.state.zoom);
      }
    componentDidMount() {
        this.olmap.setTarget("map");
    
        // Listen to map changes
        this.olmap.on("moveend", () => {
          let center = this.olmap.getView().getCenter();
          let zoom = this.olmap.getView().getZoom();
          let fsinir = transformExtent(this.olmap.getView().calculateExtent(), 'EPSG:3857', 'EPSG:4326')
          this.setState({sinir: fsinir, center:center, zoom:zoom});
        });
        var container = document.getElementById('popup');
        this.overlay1 = new Overlay({
          element: this.overl.current,
          autoPan: true,
          autoPanAnimation: {
            duration: 250,
          },
        });
        this.olmap.addOverlay(this.overlay1);
        this.olmap.on('singleclick',  (evt) => {
          var feature = this.olmap.forEachFeatureAtPixel(evt.pixel, function (feature) {
            if (feature.getGeometry().getType()==="Point") {
              return feature;
            }
            
          });
          if(feature) {
            var coordinates = feature.getGeometry().getCoordinates();
            var name = feature.getProperties().name;
            this.setState({overlay: true, overlaycont:name});
            this.overlay1.setPosition(coordinates);
            
          }
          else {
            this.closer();
          }
          var coordinate = evt.coordinate;
          var hdms = toStringHDMS(toLonLat(coordinate));
          
          
          
        });

      }
      componentDidUpdate(prevProps, prevState, snapshot) {
        if ( prevState.data===false && this.state.data===true) {
          var container = document.getElementById('popup');
          this.overlay1.setElement( this.overl.current);
        }
      }
    useract() {
      this.setState({data: true});
      
    }
    
    cleaning() {
        console.log("data temizliği başlıyor...");
        this.setState({
          data: false, 
          poligonlar: [],
          noktalar: []
        });
        this.source.clear();
        this.noktasource.clear();
      }
      handleChange(e) {
        let value = e.target.value;
        this.setState({filtre: value});
        this.noktasource.clear();
        
        let eklenecek = this.veri[2][value];
        eklenecek.forEach(element => {
          this.noktasource.addFeature(element);
        });
    }

    closer() {
      this.overlay1.setPosition(undefined);
      this.setState({overlay: false});
    }

    overlayContent(props) {
      if (props.overlay ) {
        let name = props.overlaycont;
        return (
        <div>  
        <p>Name: {name} </p>
        <a href="#" id="popup-closer" className="ol-popup-closer" onClick= {() => this.closer()}></a>
        </div>
        );
      } else {
        return null;
      }
    }

    
    render() {
      this.updateMap();
      if (this.state.data) {
        return (
          <div id="main" >
            <div id="map" style={{ width: "100%", height: "360px" }}></div>
            <button onClick=
            
            {e => { 
              this.source.clear();
              this.noktasource.clear();
              userAction(this.state,this.source,this.veri)}}>Görünen koordinatlardan(Bounding box) veri alınması</button>
            <button onClick={e2 => this.cleaning()}> Verileri sil</button>
            <Tablo noktalar={this.veri[0]} poligon={this.veri[1]}>
            </Tablo>

            <form>
           <input type="radio" value="place_of_worship" id="worship"
             onChange={this.handleChange} name="noktalar"/>            <label htmlFor="worship">Cami/Kilisi</label>

           <input type="radio" value="school" id="school" 
             onChange={this.handleChange} name="noktalar"/>            <label htmlFor="school" >Okul</label>

           <input type="radio" value="bank" id="bank" 
             onChange={this.handleChange} name="noktalar"/>            <label htmlFor="bank" >Banka</label>
        </form>
        <div> <div id="popup" className="ol-popup" ref={this.overl}>

          
          <div id="popup-content">    
              <this.overlayContent overlay={this.state.overlay} overlaycont={this.state.overlaycont}> </this.overlayContent>
           </div>
        </div> </div>
         



          </div>
        );
      }
      else {
        return (
          <div id="main" >
            <div id="map" style={{ width: "100%", height: "360px" }}></div>
            <button onClick=
            
            {e => { 
              userAction(this.state,this.source,this.veri)}}>Görünen koordinatlardan(Bounding box) veri alınması</button>
            <button onClick={e2 => this.cleaning()}>Verileri sil</button>
            <button onClick={e2 => this.useract()}>Tablo Yap</button>
            <div> <div id="popup" className="ol-popup" ref={this.overl}>

          
          <div id="popup-content">    
              <this.overlayContent overlay={this.state.overlay} overlaycont={this.state.overlaycont}>
                 </this.overlayContent>
           </div>
        </div> </div>
            
           </div>
        );
      }
      
    }
}

export default PublicMap;