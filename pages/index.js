import { useState } from "react";
import axios from "axios";
import styles from "../styles/Home.module.css";

const url = process.env.NEXT_PUBLIC_CLIENT_URL;

export default function Home(props) {
	const [todos, setTodos] = useState(props.todos);
	const [todo, setTodo] = useState({ todo: "" });
	const [searchTerm, setSearchTerm] = useState('')
	const handleChange = ({ currentTarget: input }) => {
		input.value === ""
			? setTodo({ todo: "" })
			: setTodo((prev) => ({ ...prev, todo: input.value }));

		setSearchTerm(input.value)
	};
	const press_enter = async (e) => {
        if (e.key === 'Enter') {
			return true
        }
    }
	const addTask = async (e) => {
		e.preventDefault();
		try {
			if (todo.id) {
				const { data } = await axios.put(url + "/" + todo.id, {
					todo: todo.todo,
				});
				const originalTasks = [...todos];
				const index = originalTasks.findIndex((t) => t.id === todo.id);
				originalTasks[index] = data.result[0];
				setTodos(originalTasks);
				setTodo({ todo: "" });
			} else {
				await axios.post(url, todo).then(res => {
					setTodos((prev) => [...prev, res.data.result]);
					setTodo({ todo: "" });
				}).catch(err => {
					return alert(err.response.data.message)
				})

			}
		} catch (error) {
			console.log(error);
		}
	};

	const editTask = (id) => {
		const currentTask = todos.filter((todo) => todo.id === id);
		setTodo(currentTask[0]);
	};

	const updateTask = async (id) => {
		try {
			const originalTasks = [...todos];
			const index = originalTasks.findIndex((t) => t.id === id);
			const { data } = await axios.put(url + "/" + id, {
				isCompleted: (!originalTasks[index].isCompleted).toString(),
			});
			originalTasks[index] = data.result[0];
			setTodos(originalTasks);
		} catch (error) {
			console.log(error);
		}
	};

	const deleteTask = async (id) => {
		try {
			const { data } = await axios.delete(url + "/" + id);
			setTodos((prev) => prev.filter((todo) => todo.id !== id));
		} catch (error) {
			console.log(error);
		}
	};
	return (
		<main className={styles.main}>
			<h1 className={styles.heading}>VTech - coding challenge v3</h1>
			<div className={styles.container}>
				<form onSubmit={addTask} className={styles.form_container}>
					<input
						className={styles.input}
						type="text"
						placeholder="Task to be done..."
						onChange={handleChange}
						value={todo.todo}
					/>
				</form>
				{todos.filter((todo_item) => {
					// search filter 
					if (searchTerm === '') {
						return todo_item
					} else if (todo_item.todo.toLowerCase().includes(searchTerm.toLocaleLowerCase()) ) {
						return todo_item
					} 
				}).map((todo_item) => (
					<div className={styles.task_container} key={todo_item.id}>
						<p
							className={
								todo_item.isCompleted
									? styles.task_text + " " + styles.line_through
									: styles.task_text
							}
						>
							{todo_item.todo}<br />
							<small className={styles.createdAt} >{todo_item.createdAt}</small>
						</p>
						<input
							type="checkbox"
							className={styles.check_box}
							checked={todo_item.isCompleted}
							onChange={() => updateTask(todo_item.id)}
						/>
						<button
							onClick={() => editTask(todo_item.id)}
							className={styles.edit_task}
						>
							&#9998;
						</button>
						<button
							onClick={() => deleteTask(todo_item.id)}
							className={styles.remove_task}
						>
							&#10006;
						</button>
					</div>
				))}
				{todos.length === 0 && <h2 className={styles.no_tasks}>No todo item</h2>}
			</div>
		</main>
	);
}

export const getServerSideProps = async () => {
	const { data } = await axios.get(url);
	return {
		props: {
			todos: JSON.parse(JSON.stringify(data.result)),
		},
	};
};
