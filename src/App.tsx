import React, { useState } from "react";
import "./App.css";
import InputField from "./components/InputField";
import TodoList from "./components/TodoList";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Todo } from "./helpers/helpers";
import { utils, writeFile } from "xlsx";

const App: React.FC = () => {
  const [todo, setTodo] = useState<string>("");
  const [todos, setTodos] = useState<Array<Todo>>([]);
  const [CompletedTodos, setCompletedTodos] = useState<Array<Todo>>([]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();

    if (todo) {
      setTodos([...todos, { id: Date.now(), todo, isDone: false }]);
      setTodo("");
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    console.log(result);

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    let add;
    let active = todos;
    let complete = CompletedTodos;
    // Source Logic
    if (source.droppableId === "TodosList") {
      add = active[source.index];
      active.splice(source.index, 1);
    } else {
      add = complete[source.index];
      complete.splice(source.index, 1);
    }

    // Destination Logic
    if (destination.droppableId === "TodosList") {
      active.splice(destination.index, 0, add);
    } else {
      complete.splice(destination.index, 0, add);
    }

    setCompletedTodos(complete);
    setTodos(active);
  };

  const exportToExcel = (data: Array<Todo>) => {
    // Convert the todo list data into an array of arrays compatible with XLSX
    const excelData = data.map((todo) => [todo.id, todo.todo, todo.isDone]);

    // Create a new workbook and worksheet
    const workbook = utils.book_new();
    const worksheet = utils.aoa_to_sheet(excelData);

    // Add the worksheet to the workbook
    utils.book_append_sheet(workbook, worksheet, "Todo List");

    // Generate an Excel file and save it
    writeFile(workbook, "todo_list.xlsx");
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="App">
        <h1 className="heading">Task Manager</h1>
        <InputField todo={todo} setTodo={setTodo} handleAdd={handleAdd} />
        <TodoList
          todos={todos}
          setTodos={setTodos}
          CompletedTodos={CompletedTodos}
          setCompletedTodos={setCompletedTodos}
        />
        <button className="export" onClick={() => exportToExcel(todos)}>
          Export to Excel
        </button>
      </div>
    </DragDropContext>
  );
};

export default App;