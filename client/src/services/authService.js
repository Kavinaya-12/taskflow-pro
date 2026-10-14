import api from './api'

export const registerUser=async(userData)=>{

const response=await api.post(
'/auth/register',
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

const response=await api.post(
'/auth/login',
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

const token=JSON.parse(localStorage.getItem("user") || 'null')?.token;

const response=
await api.delete(
'/auth/delete-account',
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

const token=JSON.parse(localStorage.getItem("user") || 'null')?.token;

const response=
await api.put(
'/auth/update-password',
passwordData,
{
headers:{
Authorization:
`Bearer ${token}`,
},
}
);

if(response.data.token){
const current=JSON.parse(localStorage.getItem('user') || 'null') || {};
localStorage.setItem('user',JSON.stringify({...current,token:response.data.token}));
}

return response.data;
};

export const logoutUser=async(token)=>{
const response=await api.post('/auth/logout',{}, {
headers:{Authorization:`Bearer ${token}`},
});
return response.data;
};

export const updateProfile = async (profileData) => {
  const token = JSON.parse(localStorage.getItem('user') || 'null')?.token
  const response = await api.put('/auth/profile', profileData, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return response.data
}
