import React from "react";
import { useState,useEffect,useRef } from "react";
import "./App.css"
import autoAnimate from '@formkit/auto-animate'

const App = () =>{
  const [TDL,updateTDL] = useState([])
  const [task,updateTask] = useState("")
  const [count,updateCount] = useState(0)
  const parentRef = useRef();
  useEffect(()=>{
    if(parentRef.current)
      {
        autoAnimate(parentRef.current);
      }
  },[parentRef]);
  const click = () =>
    {
      const cleanedTask = task.trim()
      if (cleanedTask === "")
      {
        alert("Task can't be empty");
        updateTask("");
        return
      }
      updateTask(cleanedTask)
      updateCount(prev => prev + 1)
      updateTDL(prev => [...prev,{count : count,value : task}])
      updateTask("");
    }
  const del = (k) =>
    {
      const list = TDL.filter(item => item.count !== k)
      updateTDL(list)
    }

    const update = (newtask) =>
      {
        const list = TDL.map(item => {
          if(item.count===newtask.count){
            return newtask
          }
          return item
        })
      updateTDL(list)
      }
    const handlingSubmit = (e) =>
      {
        e.preventDefault();
        click();
      }
  
  return <div>
    <h1 className= "top">TO-DO</h1>
    <p className="top-subtext">So you don't forget anything :{")"}</p>
    <form className="container" onSubmit={(e)=>handlingSubmit(e)}>
      <input value = {task} type = "text" onChange={(e) => updateTask(e.target.value)}  className="addTask"></input>
      <button className="add">+</button>
    </form>
    <ul ref={parentRef}>
    {TDL.map((x) => {
      return  <div className="parent">
          <h2 className="listitem">-{"> "}{x.value}</h2>
          <div className="deletedit">
            <Edit task={x} updateNewTask={update} />
            <button  onClick={()=>del(x.count)}>🗑️</button>
          </div>
        </div>
    }) }
    </ul>
  </div>
}

const Edit = (props)=>
  {
    const {task,updateNewTask} = props
    const [inputVal, setInputVal] = useState(task.value)
    const [editBox,updateEditBox] = useState(false);
    const onEdit = () =>
      {
        updateEditBox((prev)=>{
          const newVal = !prev
          if(!newVal){
            if(inputVal.trim() === "")
              {
                alert("More than one charectar please!")
                return
              }
            updateNewTask({count: task.count,value : inputVal})
          }
          return newVal
        })
      }
      const submitHandle = (e) => {
        e.preventDefault()
        onEdit()
      }
    return<>
      <form onSubmit={submitHandle}>
        {editBox && <input className = "edittextbox" type = "text" value={inputVal} onChange={(e)=>setInputVal(e.target.value)}></input>}
        <button>{editBox?'Update':'Edit'}</button>
      </form>
    </>
  }

export default App;