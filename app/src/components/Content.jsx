import React from 'react';
import Dimmer from './Dimmer.jsx';

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

  onChangeCommunity(e){
    let complaint = this.state.complaint;
    complaint.community = this.state.list_communities[e.target.value].name;
    let community_towers = this.state.list_communities[e.target.value].towers;
    this.setState({
      complaint:complaint,
      community_towers:community_towers
    })
  }

  onChangeTower(e){
      let complaint = this.state.complaint;
      complaint.tower = e.target.value;
      this.setState({
          complaint:complaint
      })
  }

  render() {

    let table_not_solved = this.state.list_not_solved.map((e,i)=>{
    return (
      <tr key={i}>
        <td>{e.fecha}</td>
        <td>{e.address}</td>
        <td>
          <Form>
          <Form.Field control='select' onChange={this.onChangeCommunity.bind(this)}>
              <option value=''>No asignada</option>
              {this.state.list_communities.map((e,i)=>{
                  return (
                    <option key={i} value={i}>{e.name}</option>
                    )
              })}
              
          </Form.Field>
          </Form>
        </td>
        <td>
          <Form>
          <Form.Field control='select' onChange={this.onChangeTower.bind(this)}>
              <option value=''></option>
              {this.state.community_towers.map((e,i)=>{
                  return (
                    <option key={i} value={e}>{e.replace("_", " ")}</option>
                    )
              })}
          </Form.Field>
          </Form>
        </td>
        <td>{e.name}</td>
        <td>{e.description}</td>
        <td><button className="ui small blue button">Actualizar</button></td>
      </tr>
      )
    })

    let table_solved = this.state.list_solved.map((e,i)=>{
    return (
      <tr key={i}>
        <td>{e.fecha}</td>
        <td>{e.address}</td>
        <td>{e.community}</td>
        <td>{e.tower}</td>
        <td>{e.name}</td>
        <td>{e.description}</td>
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
                  <th>Administrar</th>
                </tr>
              </thead>
              <tbody>
                {table_solved}
              </tbody>
            </table>
          :<div>No hay reclamos resueltos</div>
        }
    </div>
    )
  }
}

