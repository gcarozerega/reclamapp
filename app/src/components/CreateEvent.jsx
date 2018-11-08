import React from 'react';
import EventFormData from './EventFormData.jsx';
import LabelLister from './LabelLister.jsx';
import DocumentLister from './DocumentLister.jsx';
import ToggleButton from './ToggleButton.jsx';
import Dimmer from './Dimmer.jsx';
import ControlSegment from './ControlSegment.jsx';
import randomString from 'random-string'

import {
  Dropdown,
  Button,
  Segment
} from 'semantic-ui-react';

var $ = jQuery;

export default class CreateEvent extends React.Component {
  constructor(props) {
      super(props);
      this.state = 
      { 
        new_event : {
          name : "",
          location : "",
          segments :[],
          guestdata : [],
          link: "",
          type: 'event'
          }, 
        dimmer : {
          msg_first: "",
          msg_second: "",
          icon: ""
        },

        print:false,
        control:false,
        attributes:[],
        segments:[],
        segments_h:[],
        documents:[],

        controls:[]
      };
  }

  componentWillMount(){
    
  }

  componentDidMount(){
    // Evento enviado ha sido recibido
    socket.on("new_event_received", data => {
      console.log("evento fue recibido por el servidor")
      var dimmer = {
          msg_first: "Creado",
          msg_second: "Evento creado con éxito",
          icon: "checkmark"
      };
      let state = this.state;
      state.dimmer = dimmer;
      this.setState(state);
      setTimeout(function(){
          $('.page.dimmer:first').dimmer('hide');
          var href = "/";
          //var hashHistory = require('react-router').hashHistory; 
          //hashHistory.push(href);    
          var useRouterHistory = require('react-router').useRouterHistory;
          var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
          appHistory.push(href);
      }, 2000);
    });

    // Evento enviado ha sido recibido con error
    socket.on("new_event_error", data => {
      console.log("evento fue recibido por el servidor pero con error")
      var error = data.reason;
      console.log(error);

      var dimmer = {
          msg_first: "Error al crear el evento",
          msg_second: "Respuesta: " + error,
          icon: "remove"
      };
      let state = this.state;
      state.dimmer = dimmer;
      this.setState(state);

      setTimeout(function(){
          $('.page.dimmer:first').dimmer('hide');
      }, 2000);
    });
  }

  componentWillUnmount(){
    socket.off('new_event_received');
    socket.off('new_event_error');
  }

  submit_new_event(){
    console.log("Enviar!");
    var state = this.state;
    var new_event = {
      name: this.refs["formdata"].refs["name"].value,
      location: this.refs["formdata"].refs["location"].value,
      print: this.refs["print"].state.active,
      segments: this.refs["segments"].state.elements,
      guestdata: this.refs["guestdata"].state.elements,
      guestdata_h: this.refs["guestdata"].state.elements_h,
      attachments: this.refs["attachments"].state.elements,
      link: randomString({length: 20}),
      type: 'event'
    }

    if(this.state.control){
      new_event["control"] = {
        control_attribute:this.state.control_attribute,
        controls:this.state.controls
      }
    }

    state.new_event = new_event;

    var dimmer = {
      msg_first: "Creando evento",
      msg_second: "",
      icon: "asterisk loading"
    };
    state.dimmer = dimmer;

    this.setState(state);
    console.log('creating new event', new_event);
    socket.emit("new_event", {new_event:new_event,token:localStorage.getItem('access_token')});
    $('.page.dimmer:first').dimmer('show');
  }

  togglePrint(){
    if(this.state.print){
      this.setState({
        print:false
      })
    } else {
      this.setState({
        print:true
      })
    }
  }

  toggleControl(){
    if(this.state.control){
      this.setState({
        control:false
      })
    } else {
      this.setState({
        control:true
      })
    }
  }

  handleAttributeChange(att){
    this.setState({attributes:att});
  }

  handleSegmentChange(seg,seg_h){
    this.setState({
      segments:seg,
      segments_h:seg_h
    })
  }

  handleDocumentChange(docs){
    this.setState({documents:docs})
  }

  idGen() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  }

  addControl(){
    let controls = this.state.controls;

    controls.push({
      id:"control_s"+this.idGen(),
      name:"",
      segment_control:[]
    })

    this.setState({
      controls:controls
    })
  }

  deleteControl(id){
    let controls = this.state.controls;

    controls.splice(controls.findIndex(c => c.id==id),1);

    this.setState({
      controls:controls
    })
  }

  handleSaveControl(id,data){
    let controls = this.state.controls;
    let c_idx = controls.findIndex(c => c.id==id);
    if(c_idx!=-1){
      controls[c_idx] = {
        id:id,
        name:data.name,
        segment_control:data.segment_control
      },
      this.setState({
        controls:controls
      })
    }
    
  }

  handleControlAttChange(e,data){
    this.setState({
      control_attribute:data.value
    })
  }

  render() {
    let atribute_options = this.state.attributes.map((e,i)=>{
      return {
        text:e,
        value:e
      }
    })

    let control_displays = this.state.controls.map((e,i)=>{
      return <ControlSegment  key={e.id} id={e.id} 
                              deleteAction={this.deleteControl.bind(this)} 
                              segments={this.state.segments} 
                              saveControl={this.handleSaveControl.bind(this)}
                              controls={this.state.controls}/>
    })

    let control_configuration = (
      <div>
        <h4 className={"ui red dividing header"}>Generación de controles</h4>
        {control_displays}
        <Button icon circular color="green" icon="plus" size="tiny" onClick={this.addControl.bind(this)}/>
      </div>
    )

    return (
     <div>
      <h1 className="ui orange dividing header">
        <i className="calendar outline icon"></i>
        <div className="content">
          Crear evento
        </div>
        <div className="sub header">
          Ingresa un nuevo evento en el sistema
        </div>
      </h1>
      <div className="ui hidden divider"></div>
      <div className="ui form">
          <EventFormData ref="formdata" color="teal" text="Información del evento"/>
          <div className="ui hidden divider"></div>
          
          <div>
            <ToggleButton name="Impresión" ref="print" active={this.state.print} handleChange={this.togglePrint.bind(this)}/>
            <ToggleButton name="Control" active={this.state.control} handleChange={this.toggleControl.bind(this)}/>
          </div>
          
          <div className="ui hidden divider"></div>
          <LabelLister  ref="segments" 
                        type="segments" 
                        header_color="purple" 
                        form_color="olive" 
                        title="Segmentación de usuarios" 
                        name="input_segment" 
                        placeholder="Nombre del segmento. Enter para agregar."
                        elements={this.state.segments}
                        elements_h={this.state.segments_h?this.state.segments_h:[]}
                        handleChange={this.handleSegmentChange.bind(this)}
                        />
          <div className="ui hidden divider"></div>
          
          <LabelLister  ref="guestdata" 
                        type="guestdata" 
                        header_color="green" 
                        form_color="yellow" 
                        title="Datos de usuarios" 
                        name="input_guestdata" 
                        placeholder="Nombre del atributo. Enter para agregar." 
                        elements={this.state.attributes}
                        handleChange={this.handleAttributeChange.bind(this)}
                        />

          <div className="ui hidden divider"></div>

          {(this.state.control && this.state.attributes.length>0)?
            <Dropdown
            selection 
            options={atribute_options}
            placeholder={"Seleccionar atributo de control..."}
            value={this.state.control_attribute}
            onChange={this.handleControlAttChange.bind(this)}
          />
          :null}
        
          {this.state.control?control_configuration:null}
          
          

          <div className="ui hidden divider"></div>
          <DocumentLister ref="attachments" 
                          header_color="blue" 
                          form_color="pink" 
                          title="Imagenes Adjuntas" 
                          name="input_attachments" 
                          placeholder="Arrastra una imagen o haz click para seleccionar un archivo." 
                          handleChange={this.handleDocumentChange.bind(this)}
                          />
        <div className="ui hidden divider"></div>
          <div className="ui positive button" onClick={this.submit_new_event.bind(this)}>
            <i className="add circle icon"></i>
            Crear nuevo evento
          </div>
      </div>

      <Dimmer 
        msg_first={this.state.dimmer.msg_first} 
        msg_second={this.state.dimmer.msg_second} 
        icon={this.state.dimmer.icon}
      />

     </div>
    );
  }
}