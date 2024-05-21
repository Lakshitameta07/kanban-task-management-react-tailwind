import { createSlice } from "@reduxjs/toolkit";
const initialState = {
};

const boardsSlice = createSlice({
  name: "boards",
  initialState,
  reducers: {
    addBoard: (state, action) => {
      const { name, newColumns } = action.payload;
      const isActive = state.boards.length > 0 ? false : true;
      const newBoard = {
        name,
        isActive,
        columns: newColumns,
      };
      state.boards.push(newBoard);
    },
    editBoard: (state, action) => {
      const { name, newColumns } = action.payload;
      const board = state.boards.find(board => board.isActive);
      if (board) {
        board.name = name;
        board.columns = newColumns;
      }
    },
    deleteBoard: (state) => {
      const index = state.boards.findIndex(board => board.isActive);
      if (index !== -1) {
        state.boards.splice(index, 1);
      }
    },
    setBoardActive: (state, action) => {
      const { index } = action.payload;
      state.boards.forEach((board, i) => {
        board.isActive = i === index;
      });
    },
    addTask: (state, action) => {
      console.log(action.payload)
      const { title, task_status, description, subtasks, newColIndex, assignedDeveloperName, assignedDeveloperId, taskId } =
        action.payload;
      const task = {
        title,
        description,
        subtasks,
        task_status,
        assignedDeveloperName,
        assignedDeveloperId,
        taskId
      };
      const board = state.boards.find(board => board.isActive);
      if (board) {
        const column = board.columns.find((col, index) => index === newColIndex);
        column.tasks.push(task);
      }
    },
    editTask: (state, action) => {
      const {
        title,
        status,
        description,
        subtasks,
        prevColIndex,
        newColIndex,
        taskIndex,
        assignedDeveloperName,
        assignedDeveloperId,
      } = action.payload;
      const board = state.boards.find(board => board.isActive);
      if (board) {
        const prevCol = board.columns[prevColIndex];
        const newCol = board.columns[newColIndex];
        const task = prevCol.tasks[taskIndex];
        if (task) {
          task.title = title;
          task.status = status;
          task.description = description;
          task.subtasks = subtasks;
          task.assignedDeveloperName = assignedDeveloperName;
          task.assignedDeveloperId = assignedDeveloperId;

          if (prevColIndex !== newColIndex) {
            prevCol.tasks.splice(taskIndex, 1);
            newCol.tasks.push(task);
          }
        }
      }
    },
    dragTask: (state, action) => {
      const { colIndex, prevColIndex, taskIndex } = action.payload;
      const board = state.boards.find(board => board.isActive);
      if (board) {
        const prevCol = board.columns[prevColIndex];
        const task = prevCol.tasks.splice(taskIndex, 1)[0];
        if (task) {
          board.columns[colIndex].tasks.push(task);
        }
      }
    },
    setSubtaskCompleted: (state, action) => {
      const { colIndex, taskIndex, index } = action.payload;
      const board = state.boards.find(board => board.isActive);
      if (board) {
        const task = board.columns[colIndex].tasks[taskIndex];
        if (task) {
          const subtask = task.subtasks[index];
          if (subtask) {
            subtask.isCompleted = !subtask.isCompleted;
          }
        }
      }
    },
    setTaskStatus: (state, action) => {
      const { colIndex, newColIndex, taskIndex, status } = action.payload;
      const board = state.boards.find(board => board.isActive);
      if (board && colIndex !== newColIndex) {
        const task = board.columns[colIndex].tasks[taskIndex];
        if (task) {
          task.status = status;
          board.columns[colIndex].tasks.splice(taskIndex, 1);
          board.columns[newColIndex].tasks.push(task);
        }
      }
    },
    deleteTask: (state, action) => {
      const { colIndex, taskIndex } = action.payload;
      const board = state.boards.find(board => board.isActive);
      if (board) {
        const column = board.columns[colIndex];
        if (column) {
          column.tasks.splice(taskIndex, 1);
        }
      }
    },
  }
  });

export const { addBoard, editBoard, deleteBoard, setBoardActive, addTask, editTask, dragTask, setSubtaskCompleted, setTaskStatus, deleteTask } = boardsSlice.actions;

export default boardsSlice;

export const updateLocalStorage = ({ getState }) => next => action => {
  const result = next(action);
  localStorage.setItem("boards", JSON.stringify(getState().boards));
  return result;
};
