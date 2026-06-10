import {createContext,useContext,useState,} from "react";
import {registerUser,loginUser,} from "../services/authService"
const AuthContext=createContext();

export const AuthProvider=({
children,
})=>{

const [user,setUser]=useState(
JSON.parse(
localStorage.getItem("user")
)||null
);

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

const logout=()=>{

localStorage.removeItem("user");

localStorage.removeItem("token");

setUser(null);
};

return(
<AuthContext.Provider
value={{
user,
register,
login,
logout,
}}
>
{children}
</AuthContext.Provider>
);
};

export const useAuth=()=>
useContext(AuthContext);