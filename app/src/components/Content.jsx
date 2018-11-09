import React from 'react';
import Dimmer from './Dimmer.jsx';
import ManagerButton from './ManagerButton.jsx';

var $ = jQuery;

import {
  Grid,
  Form
} from 'semantic-ui-react';

export default class Content extends React.Component{
  constructor(){
    super();
    this.state = 
    { 
      list_not_solved:[],
      list_solved:[],
      list_communities:[],
      complaint:{
        community:'',
        tower:''
      },
      community_towers:[]
    }
  }
  componentDidMount(){
    socket.emit("complaints_not_solved",{token:localStorage.getItem('access_token')});
    socket.emit("complaints_solved",{token:localStorage.getItem('access_token')});
    
    socket.on("complaints_not_solved_response", data => {
      let state = this.state;
      state.list_not_solved = data.not_solved;
      this.setState(state);
    });

    socket.on("complaints_solved_response", data => {
      let state = this.state;
      state.list_solved = data.solved;
      this.setState(state);
    });

    socket.emit("community_list",{token:localStorage.getItem('access_token')});
    
    socket.on("community_list_response", data => {
      let state = this.state;
      state.list_communities = data.communities;
      this.setState(state);
    });
  }

  componentWillUnmount(){
      socket.off('complaints_not_solved');
      socket.off('complaints_not_solved_response');
      socket.off('complaints_solved');
      socket.off('complaints_solved_response');
      socket.off('community_list');
      socket.off('community_list_response');
  }

  complaint_manage(e){
    var href = "/complaint/manage/" + e.target.value;    
    var useRouterHistory = require('react-router').useRouterHistory;
    var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
    appHistory.push(href);
  }

  render() {

    let table_not_solved = this.state.list_not_solved.map((e,i)=>{
    return (
      <tr key={i}>
        <td>{e.date}</td>
        <td>{e.address}</td>
        <td>{e.community?e.community:"No asignada"}</td>
        <td>{e.tower?e.tower:"No asignada"}</td>
        <td>{e.name}</td>
        <td>{e.description}</td>
        <td><button className="ui basic blue button" value={e._id} onClick={this.complaint_manage.bind(this)}> Administrar reclamo</button></td>
      </tr>
      )
    })

    let table_solved = this.state.list_solved.map((e,i)=>{
    return (
      <tr key={i}>
        <td>{e.date}</td>
        <td>{e.address}</td>
        <td>{e.community}</td>
        <td>{e.tower}</td>
        <td>{e.name}</td>
        <td>{e.description}</td>
        <td>{e.solution}</td>
      </tr>
      )
    })

    return (
    <div>
        <h1 className="ui blue dividing header">
          Reclamos
        </h1>
        <div className="ui hidden divider"></div>
        <div className="ui big yellow label">Pendientes</div>
        {table_not_solved.length>0?
            <table className="ui compact table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Dirección</th>
                  <th>Comunidad</th>
                  <th>Torre</th>
                  <th>Residente</th>
                  <th>Descripción</th>
                  <th>Administrar</th>
                </tr>
              </thead>
              <tbody>
                {table_not_solved}
              </tbody>
            </table>
          :<div>No hay reclamos.</div>
        }
        <div className="ui divider"></div>
        <div className="ui big green label">Solucionados</div>
        <div className="ui hidden divider"></div>
        {table_solved.length>0?
            <table className="ui compact table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Dirección</th>
                  <th>Comunidad</th>
                  <th>Torre</th>
                  <th>Residente</th>
                  <th>Descripción</th>
                  <th>Solución</th>
                </tr>
              </thead>
              <tbody>
                {table_solved}
              </tbody>
            </table>
          :<div>No hay reclamos resueltos.</div>
        }
    </div>
    )
  }
}

