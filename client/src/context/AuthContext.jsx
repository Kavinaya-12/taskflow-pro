import {useEffect,useState} from "react";
import {registerUser,loginUser,logoutUser} from "../services/authService"
import AuthContext from './AuthContextStore'

export const AuthProvider=({
children,
})=>{

const [user,setUser]=useState(()=>{
try { return JSON.parse(localStorage.getItem('user') || 'null') }
catch (error) { void error; return null }
});

useEffect(()=>{
const handleUnauthorized=()=>{
try { localStorage.removeItem('user'); localStorage.removeItem('token') } catch (error) {
void error;
}
setUser(null);
};
window.addEventListener('taskflow:unauthorized',handleUnauthorized);
return()=>window.removeEventListener('taskflow:unauthorized',handleUnauthorized);
},[]);

const register=async(userData)=>{

const data=
await registerUser(userData);

setUser(data);

return data;
};

const login=async(userData)=>{

const data=
await loginUser(userData);

setUser(data);

return data;
};

const logout=({revoke=true}={})=>{
const token=user?.token;
try {
localStorage.removeItem("user");
localStorage.removeItem("token");
} catch (error) {
void error;
}
setUser(null);
if(token && revoke) logoutUser(token).catch(()=>{
});
};

const updateUser=(updated)=>{
const next={...user,...updated};
try {
localStorage.setItem('user',JSON.stringify(next));
} catch (error) {
void error;
}
setUser(next);
};

return(
<AuthContext.Provider
value={{
user,
register,
login,
logout,
updateUser,
}}
>
{children}
</AuthContext.Provider>
);
};
