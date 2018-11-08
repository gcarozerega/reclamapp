import React from 'react';
import LabelLister from './LabelLister.jsx';

import {
    Card,
    Form,
    Button,
    Message,
    Icon
} from 'semantic-ui-react';


export default class CreateCommunity extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            community:{
                name:'',
                address:'',
                admin:'',
                towers:[]
            }, 

            all_admins:[],
            nameError:false,
            serverError:false,
            loading:false,
            success:false,

            errorHeader:'',
            errorContent:''
        }
    }

    componentDidMount(){
        socket.emit("all_admins");
        
        socket.on("all_admins_response", data => {
          let state = this.state;
          state.all_admins = data.admins;
          state.community.admin = data.admins[0].name + " " + data.admins[0].last_name;
          this.setState(state);
        });

        socket.on('create_community_error',(data)=>{
            if(data.error){
                if(data.error.reason=='wrong_credentials'){
                    this.setState({
                        loading:false,
                        nameError:true,
                        errorHeader:'Credenciales no válidas.',
                        errorContent:'Las credenciales ingresadas son incorrectas.'
                    })
                } else if(data.error.reason=='community_exists'){
                    this.setState({
                        loading:false,
                        nameError:true,
                        errorHeader:'Comunidad existente.',
                        errorContent:'La comunidad que ha intentado crear ya existe.'
                    })
                } else if(data.error.reason=='db_error'){
                    this.setState({
                        loading:false,
                        serverError:true,
                        errorHeader:'Error de servidor.',
                        errorContent:'No se ha podido crear la comunidad.'
                    })
                } else if(data.error.reason=='no_community_obj'){
                    this.setState({
                        loading:false,
                        serverError:true,
                        errorHeader:'Error.',
                        errorContent:'El objeto comunidad está vacío.'
                    })
                }
            }
        })

        socket.on('create_community_success',()=>{
            this.setState({
                loading:false,
                success:true,
                community:{
                    name:'',
                    address:'',
                    admin:'',
                    towers:[]
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
        socket.off('all_admins');
        socket.off('all_admins_response');
        socket.off('create_community_error');
        socket.off('create_community_success');
    }

    onChange(key,e){
        let community = this.state.community;
        community[key] = e.target.value;
        this.setState({
            community:community
        })
    }

    handleTowerChange(tower){
      this.setState({towers:tower});
    }

    submitAction(){
        let valid=true;
        this.setState({
            nameError:false,
            serverError:false,
        },()=>{
            if(this.state.community.name.length<1){
                valid = false
                this.setState({
                    emailError:true,
                    errorHeader:'Error.',
                    errorContent:'Ingrese un nombre.'
                })
            }

            if(valid){
                this.setState({
                    loading:true
                },()=>{
                    socket.emit('create_community',{
                        token:localStorage.getItem('access_token'),
                        community:this.state.community
                    })
                })
            }
        })
    }

    render(){

        return (
            <div>
                <h3><Icon name="users"/> Crear Comunidad</h3>
                <Form
                    error={this.state.nameError}
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
                            content={"La comunidad ha sido creada con éxito"}
                    />
                    <Form.Input fluid required label='Nombre' placeholder='Ingrese nombre' value={this.state.community.name} onChange={this.onChange.bind(this,'name')}/>
                    <Form.Input fluid required label='Dirección' placeholder='Ingrese dirección' value={this.state.community.address} onChange={this.onChange.bind(this,'address')}/>
                    <Form.Field required label='Administrador' control='select' onChange={this.onChange.bind(this,'admin')}>
                        {this.state.all_admins.map((e,i)=>{
                            return (
                              <option key={i} value={e.name + " " + e.last_name}>{e.name + " " + e.last_name}</option>
                              )
                        })}
                    </Form.Field>
                    <LabelLister    ref="towers" 
                                    type="towers" 
                                    header_color="green" 
                                    form_color="blue" 
                                    title="Torres" 
                                    name="input_towers" 
                                    placeholder="Nombre de la torre. Enter para agregar." 
                                    elements={this.state.community.towers}
                                    handleChange={this.handleTowerChange.bind(this)}
                    />
                    <br/>
                    <Form.Button positive onClick={this.submitAction.bind(this)}>Crear Comunidad</Form.Button>
                </Form>
            </div>
        )
    }
}