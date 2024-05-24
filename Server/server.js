const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize, Board, Tasks, Columns } = require('./SequelizeModel')

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Test Database Connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

testConnection();

// Sync Models with Database and Start Server
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Tables synchronized successfully.');
        app.listen(process.env.PORT, () => {
            console.log(`Server started on port ${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error synchronizing tables:', error);
    });

// Define API Routes
app.get('/api/boards', async (req, res) => {
    try {
        const boards = await Board.findAll({
            include: [{
                model: Columns,
                as: 'columns',
                include: {
                    model: Tasks,
                    as: 'tasks'
                },
            }],
            order: [
                [{ model: Columns, as: 'columns' }, 'id', 'ASC'],
            ]
        });
        res.json(boards);
    } catch (error) {
        console.error('Error fetching boards:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/api/boards', async (req, res) => {
    try {
        const { name, columns } = req.body;
        // Create the board
        const newBoard = await Board.create({
            name,
            isActive: true,
        });

        // Create columns and associate them with the new board
        const createdColumns = await Promise.all(columns.map(async columnData => {
            const column = await Columns.create({
                name: columnData.name,
                boardId: newBoard.id, // Associate the column with the new board
            });
            return column;
        }));

        console.log('New board created:', newBoard);
        console.log('Columns created:', createdColumns);

        res.status(201).json(newBoard);
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({ error: 'Internal Server error' });
    }
});

app.put('/api/boards/:id', async (req, res) => {
    try {
        const { name, columns } = req.body;
        const { id } = req.params;
        console.log("This is the ID:", id);

        // Find the existing board by its primary key (id)
        const existingBoard = await Board.findByPk(id, {
            include: [{ model: Columns, as: 'columns' }]
        });
        console.log('existingBoard:', existingBoard);

        if (!existingBoard) {
            return res.status(404).json({ error: 'Board not found' });
        }

        // Update the board's name
        existingBoard.name = name;
        await existingBoard.save();
        console.log('Board name updated:', existingBoard);

        // Handle columns update
        const existingColumnIds = existingBoard.columns.map(col => col.id);
        console.log('existingColumnIds:', existingColumnIds);

        // Update existing columns and create new ones
        for (const columnData of columns) {
            console.log('Column Data:', columnData)
            if (columnData.id && existingColumnIds.includes(columnData.id)) {
                // If the column already exists, update it
                const column = await Columns.findByPk(columnData.id);
                if (column) {
                    await column.update(columnData);
                }
            } else {
                const { id: colId, ...col } = columnData;
                // If the column does not exist, create it
                await Columns.create({
                    ...col,
                    boardId: id
                });
            }
        }

        // Remove columns that are no longer in the updated columns list
        for (const existingColumn of existingBoard.columns) {
            if (!columns.some(col => col.id === existingColumn.id)) {
                await existingColumn.destroy();
            }
        }

        // Fetch the updated board with columns to return in the response
        const updatedBoard = await Board.findByPk(id, {
            include: [{ model: Columns, as: 'columns' }]
        });

        console.log('Board updated with new columns:', updatedBoard);
        res.json(updatedBoard);
    } catch (error) {
        console.error('Error updating board:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.delete('/api/boards/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('This is the ID:', id)

        const boardToDelete = await Board.findByPk(id);

        if (!boardToDelete) {
            return res.status(404).json({ error: 'Board not found' });
        }

        await boardToDelete.destroy();

        console.log('Board deleted:', boardToDelete);
        res.json({ message: 'Board deleted successfully' });
    } catch (error) {
        console.error('Error deleting board:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/alltasks', async (req, res) => {
    try {
        const tasks = await Tasks.findAll();
        console.log('These are my task:', tasks);
        res.json(tasks);
    } catch (error) {
        console.error('Error fetching boards:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/board/newtask', async (req, res) => {
    try {
        const {
            taskId,
            columnId,
            title,
            task_status,
            description,
            subtasks,
            newcolIndex,
            assignedDeveloperName,
            assignedDeveloperId,
        } = req.body;

        console.log('Request body:', req.body);

        if (!taskId || !title || !task_status || !description || !Array.isArray(subtasks) || typeof newcolIndex !== 'number' || !columnId) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        const newTask = await Tasks.create({
            taskId,
            columnId,
            title,
            task_status,
            description,
            subtasks,
            newcolIndex,
            assignedDeveloperId,
            assignedDeveloperName,
        });

        res.status(201).json({ message: 'Task created and column updated successfully', task: newTask });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.put('/api/board/tasks/:id', async (req, res) => {
    try {
        const { taskId } = req.params;
        const {
            title,
            task_status,
            description,
            subtasks,
            newcolIndex,
            assignedDeveloperName,
            assignedDeveloperId,
            columnId
        } = req.body;


        // Retrieve the existing task by its ID
        const existingTask = await Tasks.findOne(taskId);
        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        // Update the task properties
        existingTask.columnId = columnId;
        existingTask.title = title;
        existingTask.task_status = task_status;
        existingTask.description = description;
        existingTask.subtasks = subtasks;
        existingTask.newcolIndex = newcolIndex;
        existingTask.assignedDeveloperId = assignedDeveloperId;
        existingTask.assignedDeveloperName = assignedDeveloperName;

        // Save the updated task to the database
        await existingTask.save();

        console.log(existingTask);

        // Respond with the updated task
        res.json({ message: 'Task updated successfully', task: existingTask });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/boards/tasks/:id', async (req, res) => {
    try {
        const { taskId } = req.params;
        console.log('This is the ID:', taskId)

        const taskToDelete = await Tasks.findOne(taskId)

        if (!taskToDelete) {
            return res.status(404).json({ error: 'task not found' });
        }

        await taskToDelete.destroy();

        console.log('Task deleted:', taskToDelete);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/boards/tasks/:id/subtasks/:subtaskId', async (req, res) => {
    try {
        const { id, subtaskId } = req.params;
        const { isCompleted } = req.body;

        const existingTask = await Tasks.findByPk(id);
        console.log('task:', existingTask);

        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        const updateSubTask = existingTask.subtasks.map(subtask =>
            subtask.id === subtaskId ? { ...subtask, isCompleted } : subtask);
        console.log('subtaskIndex:', updateSubTask);
        existingTask.subtasks = updateSubTask
        console.log(existingTask)

        // Save the updated task
        const save = await existingTask.save();
        res.status(200).json({ message: 'Subtask status updated successfully', task: save });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/boards/tasks/:id', async (req, res) => {
    try {
        const { taskId } = req.params;
        const { columnId } = req.body

        const existingTask = await Tasks.findOne(taskId)

        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }

        existingTask.columnId = columnId;
        existingTask.task_status = columnId

        await existingTask.save();

        // console.log(existingTask);

        // Respond with the updated task
        res.json({ message: 'Task status updated successfully', task: existingTask });

    } catch (error) {
        console.error('Error updating task status:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})