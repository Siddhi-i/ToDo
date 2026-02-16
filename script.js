const addBtn = document.getElementById("addTaskBtn");
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const taskList = document.getElementById("taskList");
const filters = document.getElementById("filters");
const counterEl = document.getElementById("counter");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");

let tasks = [];
let currentFilter = "all";

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks() {
    const raw = localStorage.getItem("tasks");
    try {
        tasks = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(tasks)) tasks = [];
    } catch {
        tasks = [];
    }
}

function updateCounter() {
    const total = tasks.length;
    const active = tasks.filter(t => !t.completed).length;
    counterEl.textContent = `${active} of ${total} active`;
}

function renderTasks() {
    taskList.innerHTML = "";
    let filtered = tasks;
    if (currentFilter === "active") filtered = tasks.filter(t => !t.completed);
    if (currentFilter === "completed") filtered = tasks.filter(t => t.completed);

    filtered.forEach(task => {
        const li = document.createElement("li");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", `Complete ${task.text}`);
        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const text = document.createElement("span");
        text.className = "text" + (task.completed ? " completed" : "");
        text.textContent = task.text;

        text.addEventListener("dblclick", () => {
            const editor = document.createElement("input");
            editor.type = "text";
            editor.value = task.text;
            editor.style.width = "100%";
            li.replaceChild(editor, text);
            editor.focus();

            function commit() {
                const value = editor.value.trim();
                task.text = value || task.text;
                saveTasks();
                renderTasks();
            }
            editor.addEventListener("blur", commit);
            editor.addEventListener("keydown", (e) => {
                if (e.key === "Enter") {
                    editor.blur();
                } else if (e.key === "Escape") {
                    renderTasks();
                }
            });
        });

        const badge = document.createElement("span");
        badge.className = "badge priority-" + task.priority;
        badge.textContent = task.priority.toUpperCase();
        badge.setAttribute("aria-label", `Priority ${task.priority}`);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✕";
        deleteBtn.className = "delete-btn";
        deleteBtn.setAttribute("aria-label", `Delete ${task.text}`);
        deleteBtn.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });

        li.appendChild(checkbox);
        li.appendChild(text);
        li.appendChild(badge);
        li.appendChild(deleteBtn);
        taskList.appendChild(li);
    });

    updateCounter();
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (!taskText) {
        alert("Please enter a task!");
        return;
    }
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: prioritySelect?.value || "medium"
    };
    tasks.push(task);
    saveTasks();
    taskInput.value = "";
    renderTasks();
}

addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
});

filters.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    currentFilter = btn.dataset.filter;
    [...filters.querySelectorAll("button")].forEach(b => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", active ? "true" : "false");
    });
    renderTasks();
});

clearCompletedBtn.addEventListener("click", () => {
    tasks = tasks.filter(t => !t.completed);
    saveTasks();
    renderTasks();
});

loadTasks();
renderTasks();
