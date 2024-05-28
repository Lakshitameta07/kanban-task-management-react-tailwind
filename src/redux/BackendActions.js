import axios from "axios";

const BASE_URL = "http://localhost:1080/api";

export const FETCH_BOARDS = 'FETCH_BOARDS';
export const ADD_BOARD = 'ADD_BOARD';
export const SET_BOARD_ACTIVE = 'SET_BOARD_ACTIVE';
export const EDIT_BOARD = 'EDIT_BOARD';
export const DELETE_BOARD = 'DELETE_BOARD';

export const fetchBoards = () => async (dispatch) => {
    try {
        const response = await axios.get(`${BASE_URL}/boards`);
        dispatch({ type: FETCH_BOARDS, payload: response.data });
    } catch (error) {
        console.error('Error fetching boards:', error);
    }
};


export const addBoards = (name, columns) => async (dispatch) => {
    try {
        console.log('This is boardData', name, columns)
        const response = await axios.post(`${BASE_URL}/boards`, { name, columns });
        console.log('response:', response.data)
        dispatch({ type: ADD_BOARD, payload: response.data });

    } catch (error) {
        console.error('Error adding board:', error);
    }
};


export const setBoardActive = (activeBoard) => async (dispatch) => {
    try {
        dispatch({ type: 'SET_BOARD_ACTIVE', payload: activeBoard })
    } catch (error) {
        console.error('error setting active board', error)
    }
};

export const editBoards = (id, name, columns) => async (dispatch) => {
    try {
        await axios.put(`${BASE_URL}/boards/${id}`, { name, columns });
        console.log('name:', name, 'columns:', columns)
        dispatch({ type: 'EDIT_BOARD', payload: { id, name, columns } });
    } catch (error) {
        console.error('Error editing board:', error);
    }
};


export const deleteBoards = (id) => async (dispatch) => {
    try {
        // console.log('This is the ID:',id)
        await axios.delete(`${BASE_URL}/boards/${id}`);
        dispatch({ type: DELETE_BOARD, payload: id });
    } catch (error) {
        console.error('Error deleting board:', error);
        // Handle error appropriately
    }
};

export const fetchTasks = () => async (dispatch) => {
    try {
        const response = await axios.get(`${BASE_URL}/alltasks`);
        dispatch({ type: 'FETCH_TASKS', payload: response.data })
    } catch (error) {
        console.log('error fetching tasks:', error)
    }
};

export const addTask = (taskData) => async (dispatch) => {
    console.log('Add Task Data:', taskData);
    try {
        const response = await axios.post(`${BASE_URL}/board/newtask`, taskData);
        dispatch({ type: 'ADD_TASK', payload: response.data });
    } catch (error) {
        console.error('Error adding task:', error);
    }
};

export const editTask = (taskId, taskData) => async (dispatch) => {
    console.log('This is the id:', taskId, 'This is the taskData:', taskData)
    try {
        await axios.put(`${BASE_URL}/board/tasks/${taskId}`, taskData);
        dispatch({ type: 'EDIT_TASK', payload: { taskId, ...taskData } });
    } catch (error) {
        console.error('error updating task:', error)
    }
};

export const deleteTask = (taskId, taskData) => async (dispatch) => {
    try {
        await axios.delete(`${BASE_URL}/boards/tasks/${taskId}`, taskData);
        dispatch({ type: 'DELETE_TASK', payload: { taskId, ...taskData } });
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};

export const dragTask = ({ prevColumnId, id},column) =>async(dispatch) => {
    try{
       const {data:{task}}= await axios.put(`${BASE_URL}/boards/tasks/${id}`, column);
       const {columnId}=column
        dispatch({ type: 'DRAG_TASK', payload: {columnId, prevColumnId, taskId:id,draggedTask:task} });
    }catch(error){
        console.error('Error dragging task:', error);
    } 
}

export const setSubtaskCompleted = (id, subtaskId, isCompleted) => async (dispatch) => {
    try {
        const response = await axios.put(`${BASE_URL}/boards/tasks/${id}/subtasks/${subtaskId}`, { isCompleted });

        console.log('Response from backend:', response);
        dispatch({ type: 'UPDATE_SUBTASK_STATUS', payload: response.data });
    } catch (error) {
        console.error('Error updating subtask status:', error);
    }
};


export const setTaskStatus = (id, columnId) => async (dispatch) => {
    try {
        const response = await axios.put(`${BASE_URL}/boards/tasks/${id}`, columnId);
        console.log('Response from backend:', response);
        dispatch({ type: 'SET_TASK_STATUS', payload: response.data });
    } catch (error) {
        console.error('Error updating task status:', error);
    }
};  
