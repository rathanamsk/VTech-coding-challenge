
import { db } from "../../../db/firebase";
import { deleteDoc, doc, getDoc, query, updateDoc, where } from "firebase/firestore";
import moment from "moment";
export default async function handler(req, res) {
	const { id } = req.query;
	// update todo
	if (req.method === 'PUT') {
		try {
			const { todo, isCompleted } = req.body;
			if (!todo && !isCompleted) {
				return res.status(400).json({ message: 'Todo item need to be require!!' })
			}
			const doc_id = doc(db, 'todo_list', id)
			if (todo) {

				await updateDoc(doc_id, { todo: todo })
			}
			if (isCompleted) {

				await updateDoc(doc_id, { isCompleted: JSON.parse(isCompleted) })
			}
			let result = []
			await getDoc(doc_id).then((doc) => {
				const data = {
					id: doc.id,
					todo: doc.data().todo,
					isCompleted: doc.data().isCompleted,
					createdAt: moment(doc.data().createdAt.toDate()).format('LLLL')
				}
				result.push(data)
				// console.log(result);
			})
			return res.status(200).json({message:'success',result:result})
		} catch (err) {
			console.log(err);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}
	else if (req.method === 'DELETE') {
		try {
			const doc_id = doc(db, 'todo_list', id)
			await deleteDoc(doc_id)
			return res.status(200).json('success')
		} catch (err) {
			console.log(err);
			return res.status(500).json({ message: "Internal Server Error" });
		}
	}
}

