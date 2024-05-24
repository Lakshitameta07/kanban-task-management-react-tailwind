const initialState = {
  boards: [],
};

const backendReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_BOARDS':
      return {
        ...state,
        boards: action.payload,
      };
    case 'ADD_BOARD':
      const { ...newBoard } = action.payload;
      return {
        ...state,
        boards: [...state.boards, newBoard],
      };

    case 'SET_BOARD_ACTIVE': {
      const [...activeBoard] = action.payload
      // console.log(activeBoard)
      return {
        ...state,
        boards: activeBoard
      };
    }
    case 'EDIT_BOARD':
      console.log('Payload:', action.payload);
      return {
        ...state,
        boards: state.boards.map(board => {
          if (board.id === action.payload.id) {
            return {
              ...board,
              name: action.payload.name,
              columns: action.payload.columns ? action.payload.columns.map(column => {
                const existingColumn = board.columns.find(col => col.id === column.id);
                return existingColumn ? { ...existingColumn, ...column } : column;
              }) : []
            };
          }
          return board;
        }),
      };

    case 'DELETE_BOARD':
      // console.log(action.payload)
      return {
        ...state,
        boards: state.boards.filter(board => board.id !== action.payload)
      };
    case 'FETCH_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };
    case 'ADD_TASK':
      const { ...newTask } = action.payload.task;
      const updatedBoards = Array.isArray(state.boards) ? state.boards.map(board => board.isActive ? {
        ...board,
        columns: Array.isArray(board.columns) ? board.columns.map(
          (col, index) =>
            col.id === newTask.columnId ? {
              ...col,
              tasks: [...col.tasks, newTask]
            } : col) : []
      } : board) : [];

      console.log('Updated boards:', updatedBoards);

      return {
        ...state,
        boards: updatedBoards
      };

    case 'EDIT_TASK':
      const { ...updatedTask } = action.payload;
      console.log('updatedTask:', updatedTask);
      const updatedboards = Array.isArray(state.boards) ? state.boards.map(board => ({
        ...board,
        columns: Array.isArray(board.columns) ? board.columns.map(column => (column.id == updatedTask.columnId ? {
          ...column,
          tasks: [...column.tasks, updatedTask]
        } : {
          ...column,
          tasks: column.tasks.filter((task) => task.taskId !== updatedTask.taskId)
        })) : []
      })) : [];
      console.log('Updated boards:', updatedboards);

      return {
        ...state,
        boards: updatedboards
      };


    case 'DELETE_TASK':
      const { taskId } = action.payload
      console.log('TaskId:', taskId)
      const taskBoards = state.boards.map(board => ({
        ...board,
        columns: board.columns.map(column => ({
          ...column,
          tasks: column.tasks.filter(task => task.taskId !== taskId)
        }))
      }))
      return {
        ...state,
        boards: taskBoards
      };
    case 'UPDATE_SUBTASK_STATUS': {
      const { id, subtaskId, isCompleted, task_status } = action.payload;
      console.log('taskId:', id, 'SubtaskId:', subtaskId, 'isCompleted:', isCompleted)
      const updatedBoards = state.boards.map(board => ({
        ...board,
        columns: board.columns.map(column => ({
          ...column,
          tasks: column.tasks.map(task => {
            if (task.id === id) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask =>
                  subtask.id === subtaskId
                    ? { ...subtask, isCompleted }
                    : subtask
                )
              };
            }
            return task;
          })
        }))
      }));

      return {
        ...state,
        boards: updatedBoards
      };
    }
    case 'SET_TASK_STATUS': {
      const { task } = action.payload;
      console.log('task:', task)
      const updatedboards = Array.isArray(state.boards) ? state.boards.map(board => ({
        ...board,
        columns: Array.isArray(board.columns) ? board.columns.map(column => (column.id == task.columnId ? {
          ...column,
          tasks: [...column.tasks, task]
        } : {
          ...column,
          tasks: column.tasks.filter((oldtask) => oldtask.taskId !== task.taskId)
        })) : []
      })) : [];
      console.log('Updated boards:', updatedboards);
      return {
        ...state,
        boards: updatedboards
      };
    }
    default:
      return state;
  }
};

export default backendReducer;
