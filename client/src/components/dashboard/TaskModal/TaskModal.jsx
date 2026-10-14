import {useEffect, useRef, useState} from "react";
import styles from "./TaskModal.module.scss";
import {useTasks} from "../../../context/useTasks";
import {toast} from "react-toastify";

const TaskModal=({closeModal, task})=>{

const {createTask,updateTask}=useTasks();

const [formData,setFormData]=useState({
 title:task?.title || "",
 description:task?.description || "",
 priority:task?.priority || "Medium",
 category:task?.category || "General",
 dueDate:task?.dueDate || "",
});
const [saving,setSaving]=useState(false);
const titleRef = useRef(null);

useEffect(() => {
const previousOverflow = document.body.style.overflow;
document.body.style.overflow = "hidden";
return () => { document.body.style.overflow = previousOverflow; };
}, []);

useEffect(() => {
const handleKeyDown = (event) => {
if (event.key === "Escape" && !saving) closeModal();
};
window.addEventListener("keydown", handleKeyDown);
return () => window.removeEventListener("keydown", handleKeyDown);
}, [closeModal, saving]);

useEffect(() => {
titleRef.current?.focus();
}, []);

const handleChange=(e)=>{
setFormData({
...formData,
[e.target.name]:e.target.value,
});
};

const handleSubmit=async(e)=>{

e.preventDefault();

if(!formData.title.trim()){
toast.error("Task title is required");
return;
}
const payload={ ...formData, title: formData.title.trim() };
if(!payload.dueDate) delete payload.dueDate;
setSaving(true);
try {
if(task) await updateTask(task._id,payload);
else await createTask(payload);
closeModal();
} catch (error) {
void error;
} finally {
setSaving(false);
}
};

return(
<div className={styles.backdrop} onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) closeModal() }}>

<div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="task-modal-title">

<h3 id="task-modal-title">{task ? 'Edit task' : 'Add a task'}</h3>
<p className={styles.subtitle}>{task ? 'Update the details and keep moving.' : 'Define the next step you want to take.'}</p>

<form onSubmit={handleSubmit}>

<div className={styles.field}>
<label htmlFor="task-title">Title</label>
<input
id="task-title"
ref={titleRef}
name="title"
maxLength={200}
placeholder="e.g. Water the plants"
value={formData.title}
onChange={handleChange}
required
/>
</div>

<div className={styles.field}>
<label htmlFor="task-description">Description</label>
<textarea
id="task-description"
name="description"
maxLength={2000}
placeholder="Add a little context (optional)"
value={formData.description}
onChange={handleChange}
/>
</div>

<div className={styles.row}>

<div className={styles.field}>
<label htmlFor="task-priority">Priority</label>
<select
id="task-priority"
name="priority"
value={formData.priority}
onChange={handleChange}
className={styles.select}
>

<option value="High">High</option>
<option value="Medium">Medium</option>
<option value="Low">Low</option>
</select>
</div>

<div className={styles.field}>
<label htmlFor="task-category">Category</label>
<input
id="task-category"
name="category"
maxLength={100}
placeholder="General"
value={formData.category}
onChange={handleChange}
/>
</div>
</div>

<div className={styles.field}>
<label htmlFor="task-due">Due date</label>
<input
id="task-due"
type="date"
name="dueDate"
value={formData.dueDate}
onChange={handleChange}
/>
<p className={styles.help}>Optional — helps your My Day view. Leave blank for no date.</p>
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
className={styles.save}
disabled={saving}>
{saving ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
</button>
</div>
</form>
</div>
</div>
);
};

export default TaskModal;
