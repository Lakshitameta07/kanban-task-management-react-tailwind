import React from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import {setSubtaskCompleted} from '../redux/BackendActions'

function Subtask({ index, taskIndex, colIndex }) {
  const dispatch = useDispatch();
  const boards = useSelector((state) => state.boards);
  const board = boards.boards.find((board) => board.isActive === true);
  const col = board?.columns.find((col, i) => i === colIndex);
  const task = col?.tasks.find((task, i) => i === taskIndex);
  const subtask = task?.subtasks.find((subtask, i) => i === index);
  const checked = subtask?.isCompleted;

  const onChange = (e) => {
    dispatch(setSubtaskCompleted(task.id, subtask.id, !subtask.isCompleted)
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

Subtask.propTypes = {
  index: PropTypes.number.isRequired,
  taskIndex: PropTypes.number.isRequired,
  colIndex: PropTypes.number.isRequired,
};

export default Subtask;
