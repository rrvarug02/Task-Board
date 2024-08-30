// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Function to generate a unique task id
function generateTaskId() {
    let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;
    localStorage.setItem("nextId", nextId + 1);
    return nextId;
}

// Function to create a task card
function createTaskCard(task) {
    const $taskCard = $('<div>', {
        class: 'card task-card draggable my-3',
        'data-task-id': task.id
    });

    const $cardHeader = $('<div>', { class: 'card-header h4' }).text(task.title);
    const $cardBody = $('<div>', { class: 'card-body' });
    const $cardDescription = $('<p>', { class: 'card-text' }).text(task.description);
    const $cardDueDate = $('<p>', { class: 'card-text' }).text(task.dueDate);
    const $cardDeleteBtn = $('<button>', {
        class: 'btn btn-danger delete',
        text: 'Delete',
        'data-task-id': task.id
    }).on('click', handleDeleteTask);

    if (task.dueDate && task.status !== 'done') {
        const currentDate = dayjs();
        const dueDate = dayjs(task.dueDate, 'MM-DD-YYYY');

        if (currentDate.isSame(dueDate, 'day')) {
            $taskCard.addClass('bg-warning text-white');
        } else if (currentDate.isAfter(dueDate)) {
            $taskCard.addClass('bg-danger text-white');
            $cardDeleteBtn.addClass('border-light');
        }
    }

    $cardBody.append($cardDescription, $cardDueDate, $cardDeleteBtn);
    $taskCard.append($cardHeader, $cardBody);

    return $taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
    const $todoList = $('#todo-cards').empty();
    const $inProgressList = $('#in-progress-cards').empty();
    const $doneList = $('#done-cards').empty();

    taskList.forEach(task => {
        let targetList;
        switch (task.status) {
            case 'to-do':
                targetList = $todoList;
                break;
            case 'in-progress':
                targetList = $inProgressList;
                break;
            case 'done':
                targetList = $doneList;
                break;
            default:
                return; 
        }
        targetList.append(createTaskCard(task));
    });

    // Make task cards draggable with specific properties
    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        helper: function (event) {
            const $source = $(event.target).hasClass('ui-draggable')
                ? $(event.target)
                : $(event.target).closest('.ui-draggable');

            return $source.clone().css({
                width: $source.outerWidth(),
            });
        },
    });
}

// Function to handle adding a new task
function handleAddTask(event) {
    event.preventDefault();  

    const newTask = {
        id: generateTaskId(),
        title: $('#taskTitle').val(),
        description: $('#taskDescription').val(),
        dueDate: $('#taskDueDate').val(),
        status: 'to-do'
    };

    taskList.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();

    $('#taskTitle').val('');
    $('#taskDescription').val('');
    $('#taskDueDate').val('');
}

// Function to handle deleting task
function handleDeleteTask(event) {
    const taskId = $(event.target).data('task-id'); 
    taskList = taskList.filter(task => task.id !== parseInt(taskId, 10));  
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = Number(ui.draggable[0].dataset.taskId);
    const newStatus = event.target.id; 

    taskList.forEach((task) => {
        if (task.id === taskId) {
            task.status = newStatus;
        }
    });

    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
    if (!taskList) {
        taskList = [];
        localStorage.setItem('tasks', JSON.stringify(taskList));
    }

    if (nextId === null) {
        nextId = 1;
        localStorage.setItem('nextId', JSON.stringify(nextId));
    }

    $('#taskDueDate').datepicker({
        changeMonth: true,
        changeYear: true,
        dateFormat: 'mm-dd-yy' 
    });

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });

    renderTaskList();
    $('#taskForm').on('submit', handleAddTask);
});