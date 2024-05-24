const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

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
}, {
    tableName: 'boards',
    timestamps: false
});

const Columns = sequelize.define('columns',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true,
    },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    boardId:{
        type:DataTypes.INTEGER,
        references:{
            model:Board,
            key:'id'
        }
    }
},{
    tableName:'columns',
    timestamps:false
})

const Tasks = sequelize.define('tasks', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    },
    columnId:{
        type:DataTypes.INTEGER,
        references:{
            model:Columns,
            key:'id'
        }
    }
}, {
    tableName: 'tasks',
    timestamps: false
});

// Define Associations
Board.hasMany(Columns, { foreignKey: 'boardId', as: 'columns', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Columns.belongsTo(Board, { foreignKey: 'boardId', as: 'board' });

Columns.hasMany(Tasks, { foreignKey: 'columnId', as: 'tasks', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
Tasks.belongsTo(Columns, { foreignKey: 'columnId', as: 'column' });

module.exports = { sequelize, Board, Columns, Tasks };
