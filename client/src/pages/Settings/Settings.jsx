import {useState,useEffect} from "react";
import styles from "./Settings.module.scss";
import {FiUser,FiLock,FiBell,FiTrash2,FiLogOut,FiSave} from "react-icons/fi";
import {toast} from "react-toastify";
import {useAuth} from "../../context/useAuth";
import {deleteAccount,updatePassword,updateProfile} from "../../services/authService";

const Settings=()=>{

const {user,logout,updateUser}=useAuth();

const [profile,setProfile]=useState({
name:user?.name||"",
email:user?.email||"",
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
const value=localStorage.getItem(`theme-${user?.email}`) ?? localStorage.getItem("theme");
return value==="dark";
}catch{
return false;
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
document.documentElement.classList.toggle("light-theme",!preferences.darkMode);
document.documentElement.classList.toggle("theme-dark",preferences.darkMode);
try {
localStorage.setItem("theme",preferences.darkMode?"dark":"light");
localStorage.setItem(`theme-${user?.email}`,preferences.darkMode?"dark":"light");
} catch (error) {
void error;
}
},[preferences.darkMode,user?.email]);

const handleSaveProfile=async()=>{

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
const updated=await updateProfile(profile);
updateUser(updated);
setProfile({name:updated.name,email:updated.email});
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

const passwordResult=await updatePassword({
currentPassword:passwords.current,
newPassword:passwords.newPass,
});
if(passwordResult.token) updateUser({token:passwordResult.token});

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

const nextEnabled = !preferences.notifications;
setPreferences((current)=>({...current,notifications:nextEnabled}));
try { localStorage.setItem(`notifications-${user?.email}`, nextEnabled); } catch (error) { void error; }
toast.success(nextEnabled ? "Notifications enabled" : "Notifications disabled");
};

const toggleDarkMode=()=>{
const nextDarkMode = !preferences.darkMode;
setPreferences((current)=>({...current,darkMode:nextDarkMode}));
toast.success(nextDarkMode ? "Dark mode enabled" : "Light mode enabled");
};

const [confirmDelete,setConfirmDelete]=useState(false);
const [deleting,setDeleting]=useState(false);

const handleDelete=async()=>{

try{
setDeleting(true);
await deleteAccount();

toast.success(
"Account deleted successfully"
);

logout({revoke:false});

}catch(error){

toast.error(
error.response?.data?.message||
"Failed to delete account"
);
setDeleting(false);
setConfirmDelete(false);
}
};

return(
<div className={styles.settings}>

<div className={styles.card}>

<div className={styles.cardTitle}>
<FiUser />
<h3>Profile Settings</h3>
</div>

<div className={styles.formGroup}>
<label htmlFor="settings-name">Full Name</label>

<input
id="settings-name"
autoComplete="name"
maxLength={100}
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
<label htmlFor="settings-email">Email Address</label>

<input
id="settings-email"
type="email"
autoComplete="email"
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
type="button"
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
<label htmlFor="settings-current-password">Current Password</label>

<input
id="settings-current-password"
type="password"
autoComplete="current-password"
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
<label htmlFor="settings-new-password">New Password</label>

<input
id="settings-new-password"
type="password"
autoComplete="new-password"
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
type="button"
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
type="button"
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
type="button"
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
type="button"
className={styles.saveBtn}
onClick={logout}
>
<FiLogOut />
Logout
</button>

{confirmDelete ? (
<div className={styles.confirmBox} role="alertdialog" aria-labelledby="confirm-delete-title">
<p id="confirm-delete-title"><strong>Delete your account?</strong> This permanently removes your account and all tasks. This cannot be undone.</p>
<div className={styles.confirmActions}>
<button
type="button"
className={styles.ghostBtn}
onClick={()=>setConfirmDelete(false)}
disabled={deleting}
>
Keep my account
</button>
<button
type="button"
className={styles.deleteBtn}
onClick={handleDelete}
disabled={deleting}
>
<FiTrash2 />
{deleting ? "Deleting…" : "Yes, delete it"}
</button>
</div>
</div>
) : (
<button
type="button"
className={styles.deleteBtn}
onClick={()=>setConfirmDelete(true)}
>
<FiTrash2 />
Delete Account
</button>
)}

</div>
</div>
</div>
);
};

export default Settings;
