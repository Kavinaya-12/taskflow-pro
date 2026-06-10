import React,{useState,useEffect} from "react";
import styles from "./Settings.module.scss";
import {FiUser,FiLock,FiBell,FiTrash2,FiLogOut,FiSave} from "react-icons/fi";
import {toast} from "react-toastify";
import {useAuth} from "../../context/AuthContext";
import {deleteAccount,updatePassword} from "../../services/authService";

const Settings=()=>{

const {user,logout}=useAuth();

const [profile,setProfile]=useState({
name:user?.name||"Kavinaya",
email:user?.email||"kavinaya@gmail.com",
});

const [passwords,setPasswords]=useState({
current:"",
newPass:"",
});

const [preferences,setPreferences]=useState({
notifications:(()=>{
try{
const value=localStorage.getItem(`notifications-${user?.email}`);
return value===null?true:value==="true";
}catch{
return true;
}
})(),
darkMode:(()=>{
try{
const value=localStorage.getItem(`theme-${user?.email}`);
return value===null?true:value==="true";
}catch{
return true;
}
})(),
});

const initials=(name)=>{
if(!name) return "U";
const parts=name.split(" ").filter(Boolean);
if(parts.length===1){
return parts[0].charAt(0).toUpperCase();
}
return(
parts[0].charAt(0)+
parts[1].charAt(0)
).toUpperCase();
};

useEffect(()=>{
if(preferences.darkMode){
document.body.classList.remove("light-theme");
}else{
document.body.classList.add("light-theme");
}
localStorage.setItem(`theme-${profile.email}`,preferences.darkMode);
},[preferences.darkMode,profile.email]);

const handleSaveProfile=()=>{

if(!profile.name||!profile.email){
toast.error("All fields are required");
return;
}

const emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(!emailRegex.test(profile.email)){
toast.error("Invalid email format");
return;
}

try{
const stored=JSON.parse(localStorage.getItem("user"))||{};

const updated={
...stored,
name:profile.name,
email:profile.email,
};

localStorage.setItem("user",JSON.stringify(updated));

toast.success("Profile updated successfully");

}catch{
toast.error("Failed to save profile");
}
};

const handleUpdatePassword=async()=>{

if(!passwords.current||!passwords.newPass){
toast.error("Please fill both password fields");
return;
}

if(passwords.newPass.length<6){
toast.error("Password must be at least 6 characters");
return;
}

try{

await updatePassword({
currentPassword:passwords.current,
newPassword:passwords.newPass,
});

setPasswords({
current:"",
newPass:"",
});

toast.success("Password updated successfully");

}catch(error){

toast.error(
error.response?.data?.message||
"Failed to update password"
);
}
};

const toggleNotifications=()=>{

const updated={
...preferences,
notifications:!preferences.notifications,
};

setPreferences(updated);

localStorage.setItem(
`notifications-${profile.email}`,
updated.notifications
);

toast.success(
updated.notifications
?"Notifications enabled"
:"Notifications disabled"
);
};

const toggleDarkMode=()=>{

setPreferences({
...preferences,
darkMode:!preferences.darkMode,
});

toast.success(
preferences.darkMode
?"Light mode enabled"
:"Dark mode enabled"
);
};

const handleDelete=async()=>{

const confirmDelete=window.confirm(
"Delete account permanently?"
);

if(!confirmDelete) return;

try{

await deleteAccount();

toast.success(
"Account deleted successfully"
);

logout();

}catch(error){

toast.error(
error.response?.data?.message||
"Failed to delete account"
);
}
};

return(
<div className={styles.settings}>

<div className={styles.header}>
<h1>Settings</h1>
<p>Manage your account preferences</p>
</div>

<div className={styles.card}>

<div className={styles.cardTitle}>
<FiUser />
<h3>Profile Settings</h3>
</div>

<div className={styles.formGroup}>
<label>Full Name</label>

<input
value={profile.name}
onChange={(e)=>
setProfile({
...profile,
name:e.target.value,
})
}
/>
</div>

<div className={styles.formGroup}>
<label>Email Address</label>

<input
value={profile.email}
onChange={(e)=>
setProfile({
...profile,
email:e.target.value,
})
}
/>
</div>

<div className={styles.profileBottom}>

<button
className={styles.saveBtn}
onClick={handleSaveProfile}
>
<FiSave />
Save Changes
</button>

<div className={styles.avatar}>
{initials(profile.name)}
</div>

</div>
</div>

<div className={styles.card}>

<div className={styles.cardTitle}>
<FiLock />
<h3>Security & Password</h3>
</div>

<div className={styles.securityHeader}>

<div>
<h2>Protect Your Account</h2>

<p>
Update your password regularly
to keep your account secure.
</p>
</div>

<div className={styles.securityBadge}>
Secured
</div>

</div>

<div className={styles.formGroup}>
<label>Current Password</label>

<input
type="password"
placeholder="Enter current password"
value={passwords.current}
onChange={(e)=>
setPasswords({
...passwords,
current:e.target.value,
})
}
/>
</div>

<div className={styles.formGroup}>
<label>New Password</label>

<input
type="password"
placeholder="Create strong password"
value={passwords.newPass}
onChange={(e)=>
setPasswords({
...passwords,
newPass:e.target.value,
})
}
/>
</div>

<div className={styles.passwordTips}>
<p>• Minimum 6 characters</p>
<p>• Use uppercase & numbers</p>
<p>• Avoid common passwords</p>
</div>

<button
className={styles.saveBtn}
onClick={handleUpdatePassword}
>
<FiLock />
Update Password
</button>

</div>

<div className={styles.card}>

<div className={styles.cardTitle}>
<FiBell />
<h3>Preferences</h3>
</div>

<div className={styles.preference}>

<div>
<h4>Notifications</h4>
<p>Receive task updates</p>
</div>

<button
onClick={toggleNotifications}
className={
preferences.notifications
?styles.active
:""
}
>
{
preferences.notifications
?"ON"
:"OFF"
}
</button>

</div>

<div className={styles.preference}>

<div>
<h4>Dark Mode</h4>
<p>Toggle application theme</p>
</div>

<button
onClick={toggleDarkMode}
className={
preferences.darkMode
?styles.active
:""
}
>
{
preferences.darkMode
?"ON"
:"OFF"
}
</button>

</div>
</div>

<div className={styles.card}>

<div className={styles.cardTitle}>
<FiUser />
<h3>Account</h3>
</div>

<div className={styles.accountActions}>

<button
className={styles.saveBtn}
onClick={logout}
>
<FiLogOut />
Logout
</button>

<button
className={styles.deleteBtn}
onClick={handleDelete}
>
<FiTrash2 />
Delete Account
</button>

</div>
</div>
</div>
);
};

export default Settings;