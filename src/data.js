import React, { Component } from "react";
import Polygon from 'ol/geom/Polygon';
import {transformExtent} from 'ol/proj';
import {fromLonLat, transform} from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';

export default async function userAction(state, source,veri) {
    let sinir = state.sinir;
    let ssinir = sinirla(sinir);
    let query = query1(ssinir)
    let qpoligon = query[0]
    let qnode = query[1]
    let url = 'https://z.overpass-api.de/api/interpreter';
    let PolygonJSON = await PolyFetch(qpoligon,url);
    let array = wrapper(PolygonJSON,source);
    let noktalar = array[0];
    let polygonlar = array[1];
    veri[0] = noktalar;
    veri[1] = polygonlar;
    veri[2] = {};
    veri[2].bank = noktalar.filter(nokta => nokta.getProperties().tags["amenity"] === "bank" );
    veri[2].school = noktalar.filter(nokta => nokta.getProperties().tags["amenity"] === "school" );
    veri[2].place_of_worship = noktalar.filter(nokta => nokta.getProperties().tags["amenity"] === "place_of_worship" );
    
    
}

function sinirla(sinir) {
    let ebbox = [sinir[1],sinir[0],sinir[3],sinir[2] ];
    let stringe = JSON.stringify(ebbox[0])+','+JSON.stringify(ebbox[1])+','+JSON.stringify(ebbox[2])+','+JSON.stringify(ebbox[3]);
    return stringe
}
function query1(stringe) {
    var q2 = '[out:json] [bbox:'+ stringe   +'];(  relation["admin_level"=6]["type"= "boundary"]["boundary"= "administrative"]; map_to_area->.a;  (node(area.a)[amenity];););  out geom; ';
    var q3 = '[out:json] [bbox:'+ stringe   +'];(  node["amenity"];);  out geom; ';
    var r = [q2,q3]
    return r
}

async function PolyFetch(q, url) {
    let response; 
    response = await fetch(url,{method: 'POST',
body:q });
    let cevap = await response.json(); 
    return await cevap
  
}


async function test() {
    let url = 'https://lz4.overpass-api.de/api/interpreter';
    let q = '[out:json] [bbox:41.01935,28.83165,41.02202,29.01139];(  relation["admin_level"=6]["type"= "boundary"]["boundary"= "administrative"];);  out geom; ';
    let cevap = await PolyFetch(q, url);
    let f = await mainProcess(cevap.elements[1]);
    console.log( f);
}

function transform2(g) {
    return transform(Object.values(g).reverse(),'EPSG:4326', 'EPSG:3857');
  }

function ways(element) {
    var ways = [];
    element.members.forEach((element2,index,array)=> {
        if (element2.type ==="way") {
          ways.push(element2);
  
            }
        else; ; } ); 
    return ways
}

function processWays(ways ) {
    var ring1 = [];
    var current = ways.pop();
      
    var cord = current.geometry.map(geo=>transform(Object.values(geo).reverse(),'EPSG:4326', 'EPSG:3857'));

    ring1.push(cord);
    while(   JSON.stringify(ring1.flat()[0])    !==  JSON.stringify(ring1.flat()[ring1.flat().length - 1])) {
        
        var last = ring1.flat()[ring1.flat().length-1];

        var currentindex = ways.findIndex(way => JSON.stringify(transform2(way.geometry[0])) == JSON.stringify(last));
        
        
        
        if (currentindex == -1) {
          currentindex = ways.findIndex(way => JSON.stringify(transform2(way.geometry[way.geometry.length-1])) == JSON.stringify(last));
          
          current = ways.splice(currentindex, 1);
          
          cord = current[0].geometry.map(geo=>transform(Object.values(geo).reverse(),'EPSG:4326', 'EPSG:3857'));
          ring1.push(cord.reverse());
        } else {

          current = ways.splice(currentindex, 1);
          
          
          cord = current[0].geometry.map(geo=>transform(Object.values(geo).reverse(),'EPSG:4326', 'EPSG:3857'));
          ring1.push(cord);
          
        }
      }
    return ring1
}

function mainProcess(element, noktalar) {
    var pname = element.tags.name;
    var pid = element.id;
    let ways1 = ways(element);
    let ring1 = processWays(ways1);
    var ring = ring1.flat();
    var newg = new Polygon([ring]);
    var pnoktalar = noktalar.filter(nokta => newg.intersectsCoordinate(nokta.getGeometry().getCoordinates()));
    let banka = pnoktalar.filter(nokta => nokta.getProperties().tags["amenity"] === "bank" );
    let okul = pnoktalar.filter(nokta => nokta.getProperties().tags["amenity"] === "school" );
    let cami = pnoktalar.filter(nokta => nokta.getProperties().tags["amenity"] === "place_of_worship" );
    let feature1 = new Feature({
        geometry: new Polygon([ring]),
        name : pname,
        id : pid, 
        noktalar: pnoktalar,
        bank: banka,
        okullar: okul,
        camiler: cami,        
      });
    return feature1

}

function poly(array) {
    let pa = array.filter(e => e.type === "relation");
    return pa
}
function node(array) {
    let na = array.filter(e => e.type === "node");
    return na
}

function nodeProcess (nodes) {
    let noktalar2 = [];
    nodes.forEach((element)=> {
        var noktarr = [element.lon, element.lat];
        var cnokta = transform(noktarr, 'EPSG:4326', 'EPSG:3857' );
        var noktaid = element.id;
        var noktatag = element.tags;
        var noktaname = element.tags.name;
        
        var fnokta = new Feature({
          geometry: new Point(cnokta),
          id: noktaid,
          tags: noktatag,
          name: noktaname,
        });
        noktalar2.push(fnokta);
    
      } );
    return noktalar2
}

function wrapper(json, source) {
    let array = json.elements;
    let pa = poly(array);
    let nodes = node(array);
    let noktalar = nodeProcess(nodes);
    let polygonlar = [];
    pa.forEach(element => {
        let f = mainProcess(element,noktalar);
        source.addFeature(f);
        polygonlar.push(f);
    });
    return [noktalar,polygonlar]

}





