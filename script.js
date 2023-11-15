document.addEventListener("DOMContentLoaded", function () {
    function getTasksFromLocalStorage() {
        const storedTasks = localStorage.getItem("tasks");
        return storedTasks ? JSON.parse(storedTasks) : [];
    }

    function saveTasksToLocalStorage(tasks) {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function initializeTaskList() {
        tasks = getTasksFromLocalStorage();
        renderTasks(tasks);
    }

    function getCurrentDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const day = now.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    }


    let editingListItem = null;

    const taskNameInput = document.getElementById("taskName");
    const taskDateInput = document.getElementById("taskDate");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const searchInput = document.getElementById("searchInput");
    const taskList = document.getElementById("taskList");

    initializeTaskList();

    searchInput.addEventListener("input", function () {
        const searchTerm = searchInput.value.toLowerCase();

        if (searchTerm.length >= 3) {
            const filteredTasks = tasks.filter(task =>
                task.name.toLowerCase().includes(searchTerm) ||
                task.date.includes(searchTerm)
            );
            renderTasks(filteredTasks);
        } else {
            renderTasks(tasks);
        }
    });

    addTaskBtn.addEventListener("click", function () {
        const taskName = taskNameInput.value.trim();
        const taskDate = taskDateInput.value;

        if (taskName.length < 3 || taskName.length > 255) {
            alert("Nazwa zadania musi mieć od 3 do 255 znaków.");
            return;
        }

        if (taskDate && taskDate < getCurrentDate()) {
            alert("Data zadania nie może być wcześniejsza niż dzisiejsza data.");
            return;
        }

        const newTask = { name: taskName, date: taskDate || "" };
        tasks.push(newTask);
        saveTasksToLocalStorage(tasks); 
        renderTasks(tasks);

        taskNameInput.value = "";
        taskDateInput.value = "";
    });

    taskList.addEventListener("click", function (event) {
        const clickedElement = event.target;
        const listItem = clickedElement.closest("li");

        if (listItem) {
            if (editingListItem && editingListItem !== listItem) {
                saveChanges(editingListItem);
            }

            transformListItemToInputs(listItem);
        }
    });

    document.addEventListener("click", function (event) {
        if (!event.target.closest("#taskList")) {
            if (editingListItem) {
                saveChanges(editingListItem);
            }
        }
    });

function renderTasks(tasksToRender) {
    taskList.innerHTML = "";
    tasksToRender.forEach((task, index) => {
        const listItem = document.createElement("li");

        const taskName = highlightSearchTerm(task.name);

        listItem.innerHTML = `<strong>${taskName}</strong> - ${task.date || ""}`;
        
        const deleteButton = document.createElement("button");
        deleteButton.textContent = '✖'; 
        deleteButton.style.backgroundColor = "red";
        deleteButton.style.color = "white";
        deleteButton.style.border = "none";
        deleteButton.style.borderRadius = "50%"; 
        deleteButton.style.cursor = "pointer";
        deleteButton.addEventListener("click", () => deleteTask(index));
        listItem.appendChild(deleteButton);

        taskList.appendChild(listItem);
    });
}

    function deleteTask(index) {
        tasks.splice(index, 1); 
        saveTasksToLocalStorage(tasks); 
        renderTasks(tasks); 
    }

    function highlightSearchTerm(text) {
        const searchTerm = searchInput.value.toLowerCase();
    
        if (searchTerm.length >= 3) {
            const regex = new RegExp(searchTerm, 'gi');
            return text.replace(regex, match => `<span style="background-color: rgba(255, 251, 0, 0.548)">${match}</span>`);
        } else {
            return text;
        }
    }

    function transformListItemToInputs(listItem) {
        if (editingListItem && editingListItem !== listItem) {
            saveChanges(editingListItem);
        }

        const taskName = listItem.querySelector("strong").textContent;
        const taskDate = listItem.textContent.split(" - ")[1].slice(0, 10).trim();

        const newNameInput = document.createElement("input");
        newNameInput.type = "text";
        newNameInput.value = taskName;

        const newDateInput = document.createElement("input");
        newDateInput.type = "date";
        newDateInput.value = taskDate;

        listItem.innerHTML = "";
        listItem.appendChild(newNameInput);
        listItem.appendChild(newDateInput);

        newNameInput.focus();

        editingListItem = listItem;

        newNameInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                saveChanges(listItem);
            }
        });
    }

    function saveChanges(listItem) {
        const index = Array.from(taskList.children).indexOf(listItem);
        tasks[index] = {
            name: listItem.querySelector("input[type=text]").value,
            date: listItem.querySelector("input[type=date]").value || "",
        };

        saveTasksToLocalStorage(tasks);
        renderTasks(tasks);

        editingListItem = null;
    }
});
