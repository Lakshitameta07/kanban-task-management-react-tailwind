import { shuffle } from "lodash";
import React, { useEffect, useState } from "react";
import { useDispatch} from "react-redux";
import Task from "./Task";
import { dragTask } from "../redux/BackendActions";

function Column({ colIndex,col}) {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-sky-500",
  ];

  

  const dispatch = useDispatch();
  const [color, setColor] = useState(null)
  useEffect(() => {
    setColor(shuffle(colors).pop())
  }, [dispatch]);



  const handleOnDrop = (e,target) => {
    console.log(e.target.id)
    const { prevColumnId, taskIndex, taskId } = JSON.parse(
      e.dataTransfer.getData("text")
    );
    if(prevColumnId !==e.target.id){
      dispatch(
            dragTask({ prevColumnId, id:taskId },{ columnId: e.target.id})
          );
    }
    // if (colIndex !== prevColIndex) {
    //   dispatch(
    //     dragTask({ colIndex, prevColIndex, taskIndex })
    //   );
    // }
  };

  const handleOnDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div
      id={col.id}
      onDrop={handleOnDrop}
      onDragOver={handleOnDragOver}
      className="scrollbar-hide mx-5 pt-[90px] min-w-[280px]"
    >
      <p className=" font-semibold flex  items-center  gap-2 tracking-widest md:tracking-[.2em] text-[#828fa3]">
        <span className={`rounded-full w-4 h-4 ${color} `} />
        {col.name} ({col.tasks.length})
      </p>

      {col.tasks.map((task, index) => (
        <Task task={task} key={index} taskIndex={index} col={col}  />
      ))}
    </div>
  );
}

export default Column;
