import {useState} from "react";
import styles from "./TaskModal.module.scss";
import {useTasks} from "../../../context/TaskContext";
import {toast} from "react-toastify";

const TaskModal=({closeModal})=>{

const {createTask}=useTasks();

const [formData,setFormData]=useState({
title:"",
description:"",
priority:"Medium",
category:"General",
});

const handleChange=(e)=>{
setFormData({
...formData,
[e.target.name]:e.target.value,
});
};

const handleSubmit=async(e)=>{

e.preventDefault();

if(!formData.title){
toast.error("Task title is required");
return;
}
await createTask(formData);
toast.success("Task created successfully");
closeModal();
};

return(
<div className={styles.backdrop}>

<div className={styles.modal}>

<h3>Create Task</h3>

<form onSubmit={handleSubmit}>

<input
name="title"
placeholder="Title"
value={formData.title}
onChange={handleChange}
required
/>

<textarea
name="description"
placeholder="Description"
value={formData.description}
onChange={handleChange}
/>

<div className={styles.row}>

<select
name="priority"
value={formData.priority}
onChange={handleChange}
className={styles.select}
>

<option value="High">High </option>
<option value="Medium">Medium </option>
<option value="Low">Low </option>
</select>
<input
name="category"
placeholder="Category"
value={formData.category}
onChange={handleChange}
/>
</div>
<div className={styles.actions}>
<button
type="button"
className={styles.cancel}
onClick={closeModal}>
Cancel
</button>
<button
type="submit"
className={styles.save}>
Create Task
</button>
</div>
</form>
</div>
</div>
);
};

export default TaskModal;