const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes, where } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Sequelize Configuration
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

// Define Board Model
const Board = sequelize.define('Board', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    newColumns: {
        type: DataTypes.JSON,
        allowNull: false
    }
}, {
    tableName: 'boards',
    timestamps: false
});

const Tasks = sequelize.define('tasks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    boardId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: Board,
            key: 'id',
        }
    },
    taskId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    task_status: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    subtasks: {
        type: DataTypes.JSON,
        allowNull: false
    },
    newcolIndex: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assignedDeveloperId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    assignedDeveloperName: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    tableName: 'tasks',
    timestamps: false
});

Tasks.belongsTo(Board, {
    foreignKey: 'boardId',
    onUpdate: 'CASCADE'
})

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
        const boards = await Board.findAll();
        console.log(boards);
        res.json(boards);
    } catch (error) {
        console.error('Error fetching boards:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.post('/api/boards', async (req, res) => {
    try {
        const { name, newColumns } = req.body;
        const newBoard = await Board.create({
            name,
            isActive: true,
            newColumns,
        });
        console.log('New board created:', newBoard);
        res.status(201).json(newBoard);
    } catch (error) {
        console.error('Error creating board:', error);
        res.status(500).json({ error: 'Internal Server error' });
    }
});

app.put('/api/boards/:id', async (req, res) => {
    try {
        const { name, newColumns } = req.body;
        const { id } = req.params;
        console.log("This is the ID:", id);

        const existingBoard = await Board.findByPk(id);
        console.log(existingBoard);

        if (!existingBoard) {
            return res.status(404).json({ error: 'Board not found' });
        }
        existingBoard.name = name;
        existingBoard.newColumns = newColumns;
        await existingBoard.save();

        console.log('Board updated:', existingBoard);
        res.json(existingBoard);
    } catch (error) {
        console.error('Error updating board:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
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

});

app.get('/api/alltasks', async (req, res) => {
    try {
        const tasks = await Tasks.findAll();
        console.log(tasks);
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
            boardId,
            title,
            task_status,
            description,
            subtasks,
            newcolIndex,
            assignedDeveloperName,
            assignedDeveloperId,
        } = req.body;

        console.log('Request body:', req.body);

        if (!taskId || !title || !task_status || !description || !Array.isArray(subtasks) || typeof newcolIndex !== 'number' || !boardId) {
            return res.status(400).json({ error: 'Invalid request data' });
        }

        const newTask = await Tasks.create({
            taskId,
            boardId,
            title,
            task_status,
            description,
            subtasks,
            newcolIndex,
            assignedDeveloperId,
            assignedDeveloperName,
        });

        const board = await Board.findByPk(boardId);
        console.log(board)

        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }
        const updatedColumns = board.newColumns.map(column => (column.id === newTask.task_status ? { ...column, tasks: [...column.tasks, newTask] } : column))
        board.newColumns = updatedColumns;
        await board.save();
        res.status(201).json({ message: 'Task created and board updated successfully', task: newTask });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/board/tasks/:id',async (req,res)=>{
    try {
        const {
            title,
            task_status,
            description,
            subtasks,
            newcolIndex,
            assignedDeveloperName,
            assignedDeveloperId,
        } = req.body;
        const { id } = req.params;

        const existingTask = await Tasks.findByPk(id);
        console.log(existingTask);

        if (!existingTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        existingTask.title = title;
        existingTask.task_status = task_status;
        existingTask.description = description;
        existingTask.subtasks = subtasks
        existingTask.newcolIndex = newcolIndex;
        existingTask.assignedDeveloperId = assignedDeveloperId;
        existingTask.assignedDeveloperName = assignedDeveloperName;
        await existingTask.save();

        console.log('Task updated:', existingTask);
        res.json(existingTask);
    } catch (error) {
        console.error('Error updating board:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})

module.exports = Board;
module.exports = Tasks;
