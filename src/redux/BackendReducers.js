const initialState = {
  boards: [],
  tasks: [],
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
      return {
        ...state,
        boards: state.boards.map(board =>
          board.id === action.payload.id ? { ...board, ...action.payload } : board
        ),
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
        newColumns: Array.isArray(board.newColumns) ? board.newColumns.map(
          (col, index) => 
          col.id === newTask.task_status ? {
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
      console.log('Payload in reducer:', action.payload);
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.taskId === action.payload.taskId ? { ...task, ...action.payload } : task
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.taskId !== action.payload),
      };
    case 'EDIT_SUBTASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.taskId]: state.tasks[action.payload.taskId].map(task =>
            task.id === action.payload.subtaskId
              ? {
                ...task,
                subtasks: task.subtasks.map(subtask =>
                  subtask.id === action.payload.subtaskId
                    ? { ...subtask, title: action.payload.title, isCompleted: action.payload.isCompleted }
                    : subtask
                )
              }
              : task
          )
        }
      };
    case 'DELETE_SUBTASK':
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [action.payload.taskId]: state.tasks[action.payload.taskId].map(task =>
            task.id === action.payload.subtaskId
              ? {
                ...task,
                subtasks: task.subtasks.filter(subtask => subtask.id !== action.payload.subtaskId)
              }
              : task
          )
        }
      };
    default:
      return state;
  }
};

export default backendReducer;
