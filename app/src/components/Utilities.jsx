//usage => <RadioOption label="Warcraft 2" value="wc2" />
function RadioOption() {
  return (
    <label>
      <input type="radio" value={props.value} name={props.name} />
      {props.label}
    </label>
  )
}

import {verify_permissions,isAuthenticated as isAuth} from '../auth/auth_actions.jsx';

export function isAllowed(permission){
    return verify_permissions(localStorage.getItem('access_token'),permission);
}

export function isAuthenticated(){
    return isAuth(localStorage.getItem('access_token'));
}