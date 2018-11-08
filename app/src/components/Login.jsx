import React from 'react';

var logo = require('../../images/sercolex.png');

import {
    Card,
    Form,
    Button,
    Message
} from 'semantic-ui-react'

export default class Login extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            loading:false,
            emailError:false,
            passwordError:false,
            authError:false,
            success:false,
            username:'',
            password:'',
            errorHeader:'',
            errorContent:''
        }
    }

    componentDidMount(){
        socket.emit('login_connect');
        socket.on('authentication',(data)=>{
            console.log(data);
            if(data.error){
                if(data.error.reason=='user_notfound'){
                    this.setState({
                        loading:false,
                        emailError:true,
                        errorHeader:'Usuario no encontrado.',
                        errorContent:'El usuario ingresado no existe.'
                    })
                } else if(data.error.reason=='pwd_incorrect'){
                    this.setState({
                        loading:false,
                        passwordError:true,
                        errorHeader:'Contraseña incorrecta.',
                        errorContent:'La contraseña ingresada no es correcta.'
                    })
                } else if(data.error.reason=='db_error' || data.error.reason=='empty_credentials'){
                    this.setState({
                        loading:false,
                        authError:true,
                        errorHeader:'Error.',
                        errorContent:'Error con el sistema de autenticación.'
                    })
                }
            } else {
                //authentcated action
                this.setState({
                    loading:false
                },()=>{
                    localStorage.setItem("access_token",data.token);
                    this.loginSuccessAction();
                })
                
            }
        })

    }

    loginSuccessAction(){
        var href = "/manage";  
        var useRouterHistory = require('react-router').useRouterHistory;
        var appHistory = useRouterHistory(require('history').createHashHistory)({ queryKey: false })
        appHistory.push(href);
    }

    onUsernameChange(e){
        this.setState({
            username:e.target.value
        })
    }

    onPwdChange(e){
        this.setState({
            password:e.target.value
        })
    }

    submitAction(){
        let valid = true;
        this.setState({
            emailError:false,
            passwordError:false,
            authError:false
        },()=>{
            if(this.state.username.lenght<1 || !this.validateEmail(this.state.username)){
                valid = false;
                this.setState({
                    emailError:true,
                    errorHeader:'Usuario no válido.',
                    errorContent:'Ingrese un correo electrónico válido.'
                })
            } else if(this.state.password.length<1) {
                valid = false;
                this.setState({
                    passwordError:true,
                    errorHeader:'Contraseña no válida.',
                    errorContent:'La contraseña no puede estar vacía.'
                })
            }
    
            if(valid){
                this.setState({
                    loading:true
                },()=> {
                    socket.emit('authenticate',{
                        username:this.state.username,
                        password:this.state.password
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
        return(
            <div className="login-container">
                <Card raised className="login-card">
                    <div className="login-logo-container">
                        <img src={logo} className="login-logo"/>
                        <h4 className="login-title"> Reclamapp</h4>
                    </div>
                    <Form
                        onSubmit={this.submitAction.bind(this)}
                        loading={this.state.loading}
                        error={this.state.emailError || this.state.passwordError || this.state.authError}>
                        <Form.Input fluid 
                                    label="Email" 
                                    placeholder="contacto@sercolex.cl" 
                                    value={this.state.username} 
                                    onChange={this.onUsernameChange.bind(this)}
                                    error={this.state.emailError}
                        />
                        <Form.Input fluid 
                                    label="Contraseña" 
                                    type="password"
                                    placeholder="********" 
                                    value={this.state.password} 
                                    onChange={this.onPwdChange.bind(this)}
                                    error={this.state.passwordError}
                        />
                        <Form.Button fluid primary>Iniciar Sesión</Form.Button>
                        <Message
                            error
                            header={this.state.errorHeader}
                            content={this.state.errorContent}
                        />
                    </Form>
                </Card>
            </div>
        )
    }
}