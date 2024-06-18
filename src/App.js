import React from "react";
import { useState, useEffect, useRef } from "react";
import "./App.css";
import autoAnimate from "@formkit/auto-animate";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnhd64a6PTGX7CvYg2EETlhjE-cVomREs",
  authDomain: "to-do-app-a9f75.firebaseapp.com",
  projectId: "to-do-app-a9f75",
  storageBucket: "to-do-app-a9f75.appspot.com",
  messagingSenderId: "964935491444",
  appId: "1:964935491444:web:4ac0fe326802af978c5621",
  measurementId: "G-875YMP988Q",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Edit = (props) => {
  const { task, updateNewTask, editing, setEditing } = props;
  const [inputVal, setInputVal] = useState(task.task);
  const [editBox, updateEditBox] = useState(false);
  const [du, setDu] = useState(false);

  console.log(du,'update btn')

  const onCancel = () => {
    updateEditBox(false);
    setDu(false);
  };

  const onEdit = () => {
    setEditing(task.id);
    setInputVal(task.task);
    updateEditBox((prev) => {
      const newVal = !prev;
      if (!newVal) {
        if (inputVal.trim() === "") {
          alert("More than one charectar please!");
          setDu(false);
          return;
        }
        updateNewTask({ count: task.id, value: inputVal });
        setDu(false);
      }
      return newVal;
    });
  };

  const submitHandle = (e) => {
    e.preventDefault();
    setDu(true);
    onEdit();
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    if (val === task.task) {
      setDu(true);
    } else {
      setDu(false);
    }
  };


  useEffect(() => {
    if (editing === task.id) {
      updateEditBox(true);
    } else {
      updateEditBox(false);
      setDu(false);
    }
  }, [editing, task.id]);


  return (
    <>
      <form onSubmit={submitHandle} className="form">
        {editBox && (
          <input
            className="edittextbox"
            type="text"
            value={inputVal}
            onChange={(e) => handleChange(e)}
          ></input>
        )}
        <button disabled={du}>{editBox ? "Update" : "Edit"}</button>
      </form>
      {editBox && <button onClick={onCancel}>cancel</button>}
    </>
  );
};

const App = () => {
  const currentDate = new Date();
  const [TDL, updateTDL] = useState([]);
  const [task, updateTask] = useState("");
  const [count, updateCount] = useState(0);
  const parentRef = useRef();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);

  const getTodoItems = async () => {
    setLoading(true);
    let tasks = [];
    try {
      const q = query(collection(db, "taskitems"), orderBy("time"));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach((doc) => {
        tasks.push({ ...doc.data(), id: doc.id });
      });
      updateTDL(tasks);
    } catch (err) {
      console.log(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTodoItems();
  }, [count]);

  const addUserToFirestore = async () => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, "taskitems"), {
        time: currentDate.getTime(),
        task: task,
      });
      console.log(docRef.id);
      setLoading(false);
    } catch (e) {
      console.error("Error");
    }
  };
  useEffect(() => {
    if (parentRef.current) {
      autoAnimate(parentRef.current);
    }
  }, [parentRef]);

  const click = () => {
    console.log("TDL", TDL);
    const cleanedTask = task.trim();
    if (cleanedTask === "") {
      alert("Task cannot be empty");
      updateTask("");
      return;
    }
    updateTask(cleanedTask);
    updateCount((prev) => prev + 1);
    updateTask("");
    addUserToFirestore();
  };

  const del = async (k) => {
    try {
      setLoading(true);
      await deleteDoc(doc(db, "taskitems", k));
      updateCount((prev) => prev + 1);
      setLoading(false);
    } catch (err) {
      console.error("deletion error ", err);
    }
  };
  const update = async (newtask) => {
    try {
      setLoading(true);
      console.log(newtask.count, newtask.value, "update call");
      await updateDoc(doc(db, "taskitems", newtask.count), {
        task: newtask.value,
      });
      updateCount((prev) => prev + 1);
      setLoading(false);
    } catch (e) {
      console.log("There is an error", e);
    }
  };
  const handlingSubmit = (e) => {
    e.preventDefault();
    click();
  };

  return (
    <div>
      <h1 className="top">TO-DO</h1>
      <p className="top-subtext">So you don't forget anything :{")"}</p>
      <form className="container" onSubmit={(e) => handlingSubmit(e)}>
        <input
          value={task}
          type="text"
          onChange={(e) => updateTask(e.target.value)}
          className="addTask"
          disabled={loading}
        ></input>
        {!loading ? (
          <button className="add">+</button>
        ) : (
          <div className="loader"></div>
        )}
      </form>
      <ul ref={parentRef}>
        {TDL.map((x) => {
          return (
            <div className="parent">
              <h2 className="listitem">
                -{"> "}
                {x.task}
              </h2>
              <div className="deletedit">
                <Edit
                  task={x}
                  updateNewTask={update}
                  editing={editing}
                  setEditing={setEditing}
                />
                <button onClick={() => del(x.id)}>🗑️</button>
              </div>
            </div>
          );
        })}
      </ul>
    </div>
  );
};

export default App;
