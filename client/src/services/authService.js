import axios from "axios";

const API_URL="http://localhost:5000/api/auth";

export const registerUser=async(userData)=>{

const response=await axios.post(
`${API_URL}/register`,
userData
);

if(response.data.token){

localStorage.setItem(
"user",
JSON.stringify(response.data)
);
}

return response.data;
};

export const loginUser=async(userData)=>{

const response=await axios.post(
`${API_URL}/login`,
userData
);

if(response.data.token){

localStorage.setItem(
"user",
JSON.stringify(response.data)
);
}

return response.data;
};

export const deleteAccount=async()=>{

const token=JSON.parse(
localStorage.getItem("user")
)?.token;

const response=
await axios.delete(
`${API_URL}/delete-account`,
{
headers:{
Authorization:
`Bearer ${token}`,
},
}
);

return response.data;
};

export const updatePassword=async(passwordData)=>{

const token=JSON.parse(
localStorage.getItem("user")
)?.token;

const response=
await axios.put(
`${API_URL}/update-password`,
passwordData,
{
headers:{
Authorization:
`Bearer ${token}`,
},
}
);

return response.data;
};