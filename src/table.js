import React, { Component } from "react";


class Tablo extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            noktalar:this.props.noktalar,
            poligon:this.props.poligon,
        }    
    }
    

    
   poligonToTable(plist) {
    
    let tablolist2 = plist.map((ilce, index) => {
        
        let ilce2 = ilce.values_;
        
        const {geometry, name, id, noktalar,bank, okullar,camiler} = ilce2;
        
        return(
        <tr key={id}>
          <td>{id}</td>
          <td>{name}</td>
          <td>{bank.length}</td>
          <td>{okullar.length}</td>
          <td>{camiler.length}</td>
          
          
        </tr>
        )       
      })
    return tablolist2
   }

    render() {
        
        return(
        
        <div>
        

        <table>
        <thead>
        <tr>
            <th >OSM id</th>
            <th >İlçe İsim</th>
            <th >Banka sayisi</th>
            <th >Okul sayisi</th>
            <th >İbadethane sayisi</th>
        </tr>
    </thead>
            <tbody>
                {this.poligonToTable(this.state.poligon)}
            </tbody>

        </table>
        </div>
        )
    }
}

export default Tablo;