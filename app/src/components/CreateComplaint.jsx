import React from 'react';

import {
    Card,
    Form,
    Button,
    Message,
    Icon
} from 'semantic-ui-react';

export default class CreateComplaint extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            complaint:{
                name : "",
                phone : "",
                address : "",
                email : "",
                admin : "",
                description : ""
            }, 
            all_admins:[],

            emailError:false,
            serverError:false,
            loading:false,
            success:false,

            errorHeader:'',
            errorContent:''
        }
    }

    componentDidMount(){
        socket.emit("all_admins");
        
        socket.on('all_admins_response', data => {
          let state = this.state;
          state.all_admins = data.admins;
          this.setState(state);
        });

        socket.on('create_complaint_error',(data)=>{
            if(data.error){
                if(data.error.reason=='wrong_credentials'){
                    this.setState({
                        loading:false,
                        emailError:true,
                        errorHeader:'Credenciales no válidas.',
                        errorContent:'Las credenciales ingresadas son incorrectas.'
                    })
                } else if(data.error.reason=='db_error'){
                    this.setState({
                        loading:false,
                        serverError:true,
                        errorHeader:'Error de servidor.',
                        errorContent:'No se ha podido crear el reclamo.'
                    })
                } else if(data.error.reason=='no_complaint_obj'){
                    this.setState({
                        loading:false,
                        serverError:true,
                        errorHeader:'Error.',
                        errorContent:'El objeto reclamo está vacío.'
                    })
                }
            }
        })

        socket.on('create_complaint_success',()=>{
            this.setState({
                loading:false,
                success:true,
                complaint:{
                    name : "",
                    phone : "",
                    address : "",
                    email : "",
                    admin : "",
                    description : ""
                }
            },()=>{
                setTimeout(()=>{
                    this.setState({
                        success:false
                    })
                },7500)
            })
        })
    }

    componentWillUnmount(){
        socket.off('create_complaint_error');
        socket.off('create_complaint_success');
        socket.off('all_admins');
        socket.off('all_admins_response');
    }

    onChange(key,e){
        let complaint = this.state.complaint;
        complaint[key] = e.target.value;
        this.setState({
            complaint:complaint
        })
    }

    submitAction(){
        let valid=true;
        this.setState({
            emailError:false,
            serverError:false,
        },()=>{
            if(this.state.complaint.email.length<1 || !this.validateEmail(this.state.complaint.email)){
                valid = false
                this.setState({
                    emailError:true,
                    errorHeader:'Campo no válido.',
                    errorContent:'Ingrese un correo electrónico válido.'
                })
            }

            if(valid){
                this.setState({
                    loading:true
                },()=>{
                    socket.emit('create_complaint',{
                        token:localStorage.getItem('access_token'),
                        complaint:this.state.complaint
                    })
                })
            }
        })
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    render(){

        return (
            <div className="ui raised very padded text container segment">
                <h1 className="ui green dividing header">
                    <div className="content">
                      Formulario de Reclamos
                    </div>
                    <div className="sub header">
                      Ingrese un nuevo reclamo en el sistema
                    </div>
                </h1>
                <div className="ui hidden divider"></div>
                <Form
                    onSubmit={this.submitAction.bind(this)}
                    error={this.state.emailError || this.state.serverError}
                    loading={this.state.loading}
                    success={this.state.success}
                >
                    <Message
                            error
                            header={this.state.errorHeader}
                            content={this.state.errorContent}
                    />
                    <Message
                            success
                            icon={"check"}
                            header={"Éxito"}
                            content={"El reclamo ha sido creado con éxito"}
                    />
                    {console.log(this.state.all_admins)}
                    <Form.Input required fluid label='Nombre' placeholder='Ingrese su nombre completo' value={this.state.complaint.name} onChange={this.onChange.bind(this,'name')}/>
                    <Form.Input required fluid label='Teléfono' placeholder='Ingrese su teléfono' value={this.state.complaint.phone} onChange={this.onChange.bind(this,'phone')}/>
                    <Form.Input required fluid label='Email' placeholder='contacto@sercolex.cl' value={this.state.complaint.email} onChange={this.onChange.bind(this,'email')} error={this.state.emailError}/>
                    <Form.Field label='Administrador' control='select' placeholder='Seleccione administrador' onChange={this.onChange.bind(this,'admin')}>
                        <option value=''>Desconocido</option>
                        {this.state.all_admins.map((e,i)=>{
                            return (
                              <option key={i} value={e.name + " " + e.last_name}>{e.name + " " + e.last_name}</option>
                              )
                        })}
                    </Form.Field>
                    <Form.Input required fluid label='Dirección' placeholder='Ingrese dirección' value={this.state.complaint.address} onChange={this.onChange.bind(this,'address')}/>
                    <Form.TextArea required label='Descripción del problema' placeholder='Describa el motivo del reclamo' value={this.state.complaint.description} onChange={this.onChange.bind(this,'description')}/>
                    
                    <Form.Button positive>Enviar</Form.Button>
                </Form>
            </div>
        )
    }
}