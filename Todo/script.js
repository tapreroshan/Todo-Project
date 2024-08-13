
const title = document.getElementById("title");
const assignee = document.getElementById("assignee");
const addBtn = document.getElementById("addTodo");
const todoList = document.getElementById("todo-list");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalAssignee = document.getElementById("modalAssignee");
const updateBtn = document.getElementById("updateTodo");
const closeModalBtn = document.querySelector(".close");


let todos = [];
let currentPage = 1;
const itemsPerPage = 5;
let editId = null;

// Display Todos
const showTodos = () => {
    todoList.innerHTML = "";
    const start = (currentPage - 1) * itemsPerPage;
    const pageTodos = todos.slice(start, start + itemsPerPage);

    pageTodos.forEach(todo => {
        const row = document.createElement("tr");

        const statusCell = document.createElement("td");
        const statusCheck = document.createElement("input");
        statusCheck.type = "checkbox";
        statusCheck.checked = todo.status;
        statusCheck.addEventListener("change", () => toggleStatus(todo.id));
        statusCell.appendChild(statusCheck);
        row.appendChild(statusCell);

        const titleCell = document.createElement("td");
        titleCell.innerText = todo.title;
        row.appendChild(titleCell);

        const assigneeCell = document.createElement("td");
        assigneeCell.innerText = todo.assignee;
        row.appendChild(assigneeCell);

        const actionsCell = document.createElement("td");
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn"
        editBtn.innerText = "Edit";
        editBtn.addEventListener("click", () => openModal(todo.id));
        actionsCell.appendChild(editBtn);
//delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn"
        deleteBtn.innerText = "Delete";
        deleteBtn.addEventListener("click", async() => {
           try {
                await fetch(`http://localhost:5000/todos/${todo.id}`, { method: "DELETE" });
                fetchTodos();
            
           } catch (error) {
            console.error(error);
            
           }
        });
        actionsCell.appendChild(deleteBtn);

        row.appendChild(actionsCell);
        todoList.appendChild(row);
    });
};

// Add Todo
const addTodo = async () => {
    const newTodo = {
        id: todos.length ? todos[todos.length - 1].id + 1 : 1,
        title: title.value.trim(),
        assignee: assignee.value.trim(),
        status: false,
    };

    if (!newTodo.title || !newTodo.assignee) return;

    try {
        await fetch("http://localhost:5000/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newTodo),
        });
        todos.push(newTodo);
        title.value = "";
        assignee.value = "";
        showTodos();
    } catch (err) {
        console.error("Error adding todo:", err);
    }
};

// Toggle Status
const toggleStatus = async (id) => {
    const todo = todos.find(todo => todo.id === id);
    todo.status = !todo.status;

    try {
        await fetch(`http://localhost:5000/todos/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: todo.status }),
        });
        showTodos();
    } catch (err) {
        console.error("Error updating status:", err);
    }
};

// Open Modal
const openModal = (id) => {
    const todo = todos.find(todo => todo.id === id);
    editId = id;
    modalTitle.value = todo.title;
    modalAssignee.value = todo.assignee;
    modal.style.display = "block";
};

// Update Todo
const updateTodo = async () => {
    const updatedTodo = {
        title: modalTitle.value.trim(),
        assignee: modalAssignee.value.trim(),
    };

    if (!updatedTodo.title || !updatedTodo.assignee) return;

    try {
        await fetch(`http://localhost:5000/todos/${editId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTodo),
        });
        const todo = todos.find(todo => todo.id === editId);
        todo.title = updatedTodo.title;
        todo.assignee = updatedTodo.assignee;
        closeModal();
        showTodos();
    } catch (err) {
        console.error("Error updating todo:", err);
    }
};

// Close Modal
const closeModal = () => {
    modal.style.display = "none";
    editId = null;
};

const prevPage = () => {
    if (currentPage > 1) {
        currentPage--;
        showTodos();
    }
};

const nextPage = () => {
    if (currentPage * itemsPerPage < todos.length) {
        currentPage++;
        showTodos();
    }
};

// Fetch Todos
const fetchTodos = async () => {
    try {
        const res = await fetch("http://localhost:5000/todos");
        todos = await res.json();
        showTodos();
    } catch (err) {
        console.error("Error fetching todos:", err);
    }
};

addBtn.addEventListener("click", addTodo);
updateBtn.addEventListener("click", updateTodo);
closeModalBtn.addEventListener("click", closeModal);
prevBtn.addEventListener("click", prevPage);
nextBtn.addEventListener("click", nextPage);

fetchTodos();
