

import { async } from "@firebase/util";
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import moment from "moment";
import { db } from "../../../db/firebase";
// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
export default async function handler(req, res) {

  const firestore_collection = process.env.FIRESTORE_COLLENTION;
  //get data from firebase 
  if (req.method === 'GET') {
    try {
      const db_collection = collection(db, firestore_collection);

      const find_Todo = query(db_collection);
      const all_todo = await getDocs(find_Todo)
      let result = []
      all_todo.forEach((doc) => {
        const array = {
          id:doc.id,
          todo: doc.data().todo,
          isCompleted: doc.data().isCompleted,
          createdAt: moment(doc.data().createdAt.toDate()).format('LLLL')
        }
        result.push(array)
      });
      return res.status(200).json({message:'success',result:result})
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  // post data to firebase
  if (req.method === 'POST') {
    try {
      const { todo } = req.body
      const db_collection = collection(db, firestore_collection)

      if (!todo) {
        return res.status(400).json({ message: 'Todo item need to be require!!' })
      }
      // find todo item in database
      const find_Todo = query(db_collection, where("todo", "==", todo));
      const all_todo = await getDocs(find_Todo)
      let todo_list = []

      all_todo.forEach((doc) => {
        todo_list.push(doc.data())
      });
        
      if (todo_list.length > 0) {
        return res.status(400).json({ message: ` ${todo} is already added, please change your todo!!` })
      }
      // create doc
      const data = {
        todo: todo,
        isCompleted: false,
        createdAt: serverTimestamp()
      }
      const add_todo = await addDoc(db_collection, data)
      return res.status(200).json({ message: 'success' , result:{
        id:add_todo.id,
        todo:data.todo,
        isCompleted:data.isCompleted,
        createdAt:moment(data.createdAt).format('LLLL')
      } })
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Internal Server Error" });

    }
  }
}


