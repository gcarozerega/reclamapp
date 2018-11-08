import React from 'react';

import {
    Card,
    Form,
    Button,
    Message,
    Icon
} from 'semantic-ui-react';

export default class CreateUser extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            user:{
                name:'',
                last_name:'',
                email:'',
                pwd:'',
                confirm:'',
                role:''
            }, 
            

            emailError:false,
            pwdError:false,
            pwdConfirmError:false,
            serverError:false,
            loading:false,
            success:false,

            errorHeader:'',
            errorContent:''
        }
    }

    componentDidMount(){
        socket.on('create_user_error',(data)=>{
            if(data.error){
                if(data.error.reason=='wrong_credentials'){
                    this.setState({
                        loading:false,
                        emailError:true,
                        pwdError:true,
                        errorHeader:'Credenciales no válidas.',
                        errorContent:'Las credenciales ingresadas son incorrectas.'
                    })
                } else if(data.error.reason=='user_exists'){
                    this.setState({
                        loading:false,
                        emailError:true,
                        errorHeader:'Usuario existente.',
                        errorContent:'El usuario que ha intentado crear ya existe.'
                    })
                } else if(data.error.reason=='db_error'){
                    this.setState({
                        loading:false,
                        serverError:true,
                        errorHeader:'Error de servidor.',
                        errorContent:'No se ha podido crear el usuario.'
                    })
                } else if(data.error.reason=='no_user_obj'){
                    this.setState({
                        loading:false,
                        serverError:true,
                        errorHeader:'Error.',
                        errorContent:'El objeto de usuario está vacío.'
                    })
                }
            }
        })

        socket.on('create_user_success',()=>{
            this.setState({
                loading:false,
                success:true,
                user:{
                    name:'',
                    last_name:'',
                    email:'',
                    pwd:'',
                    confirm:''
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
        socket.off('create_user_error');
        socket.off('create_user_success');
    }

    onChange(key,e){
        let user = this.state.user;
        user[key] = e.target.value;
        this.setState({
            user:user
        })
    }

    submitAction(){
        let valid=true;
        this.setState({
            emailError:false,
            pwdError:false,
            pwdConfirmError:false,
            serverError:false,
        },()=>{
            if(this.state.user.email.length<1 || !this.validateEmail(this.state.user.email)){
                valid = false
                this.setState({
                    emailError:true,
                    errorHeader:'Usuario no válido.',
                    errorContent:'Ingrese un correo electrónico válido.'
                })
            } else if(this.state.user.pwd.length<1){
                valid = false;
                this.setState({
                    pwdError:true,
                    errorHeader:'Contraseña no válida.',
                    errorContent:'La contraseña no puede estar vacía.'
                })
            } else if(!this.validatePwd()){
                valid = false;
                this.setState({
                    pwdConfirmError:true,
                    pwdError:true,
                    errorHeader:'Confirmación fallida.',
                    errorContent:'Las contraseñas ingresadas no coinciden.'
                })
            }

            if(valid){
                this.setState({
                    loading:true
                },()=>{
                    socket.emit('create_user',{
                        token:localStorage.getItem('access_token'),
                        user:this.state.user
                    })
                })
            }
        })
    }

    validatePwd() {
        return this.state.user.confirm===this.state.user.pwd;
    }

    validateEmail(email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    render(){

        return (
            <div>
                <h3><Icon name="user"/> Crear Usuario</h3>
                <Form
                    onSubmit={this.submitAction.bind(this)}
                    error={this.state.emailError || this.state.pwdError || this.state.pwdConfirmError || this.state.serverError}
                    loading={this.state.loading}
                    success={this.state.success}
                >
                    <Form.Input fluid label='Nombre' placeholder='Nombre' value={this.state.user.name} onChange={this.onChange.bind(this,'name')}/>
                    <Form.Input fluid label='Apellidos' placeholder='Apellidos' value={this.state.user.last_name} onChange={this.onChange.bind(this,'last_name')}/>
                    <Form.Input required fluid label='Email' placeholder='contacto@handband.cl' value={this.state.user.email} onChange={this.onChange.bind(this,'email')} error={this.state.emailError}/>
                    <Form.Input required fluid label='Contraseña' type="password" placeholder='********' value={this.state.user.pwd} onChange={this.onChange.bind(this,'pwd')} error={this.state.pwdError}/>
                    <Form.Input required fluid label='Confirmar Contraseña' type="password" value={this.state.user.confirm} placeholder='Confirmar contraseña' onChange={this.onChange.bind(this,'confirm')} error={this.state.pwdConfirmError}/>
                    <Form.Field required label='Rol' control='select' placeholder='Confirmar contraseña' onChange={this.onChange.bind(this,'role')}>
                        <option value='0'>Secretaría</option>
                        <option value='1'>Administración</option>
                    </Form.Field>
                    <Form.Button positive>Crear Usuario</Form.Button>
                    <Message
                            error
                            header={this.state.errorHeader}
                            content={this.state.errorContent}
                    />
                    <Message
                            success
                            icon={"check"}
                            header={"Éxito"}
                            content={"El usuario ha sido creado con éxito"}
                    />
                </Form>
            </div>
        )
    }
}