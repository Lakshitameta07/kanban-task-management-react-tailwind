import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import {setSubtaskCompleted} from '../redux/BackendActions'

function Subtask({ index, taskIndex, colIndex,col,task,subtask }) {
  const dispatch = useDispatch();
  const[checked,setChecked]=useState(subtask?.isCompleted)

  const onChange = (e) => {
    console.log(e.target.checked);
    setChecked(!checked);
    dispatch(setSubtaskCompleted(task.id, subtask.id, e.target.checked)
    );
  };

  return (
    <div className="w-full flex hover:bg-[#635fc740] dark:hover:bg-[#635fc740] rounded-md relative items-center justify-start dark:bg-[#20212c] p-3 gap-4 bg-[#f4f7fd]">
      <input
        className="w-4 h-4 accent-[#635fc7] cursor-pointer"
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <p className={checked ? "line-through opacity-30" : ""}>
        {subtask?.title} {task?.assignedDeveloperName}
      </p>
    </div>
  );
}


export default Subtask;
