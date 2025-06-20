alert("¡Script cargado!");

document.addEventListener('DOMContentLoaded', () => {
    // --- Selectores del Menú ---
    const sidebar = document.querySelector('.sidebar');
    const menuButtons = document.querySelectorAll('.menu-btn');
    const contentSections = document.querySelectorAll('.content-section');
    const appLayout = document.querySelector('.app-layout');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar');

    // --- Lógica del Menú ---
    sidebar.addEventListener('click', (e) => {
        const targetButton = e.target.closest('.menu-btn');
        if (!targetButton) return;

        const targetSectionId = targetButton.dataset.target;
        
        // Actualizar botones
        menuButtons.forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');

        // Actualizar secciones de contenido
        contentSections.forEach(section => {
            if (section.id === targetSectionId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    });

    // --- Lógica para mostrar/ocultar el menú ---
    toggleSidebarBtn.addEventListener('click', () => {
        appLayout.classList.toggle('sidebar-hidden');
    });

    // Contactos
    const contactForm = document.getElementById('contact-form');
    const nameInput = document.getElementById('name-input');
    const phoneInput = document.getElementById('phone-input');
    const emailInput = document.getElementById('email-input');
    const contactList = document.getElementById('contact-list');

    // Tareas
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const taskDateInput = document.getElementById('task-date-input');

    // Notas
    const noteTitle = document.getElementById('note-title');
    const noteContent = document.getElementById('note-content');
    const toolbar = document.querySelector('.toolbar');
    const contactListEditor = document.getElementById('contact-list-editor');
    const saveNoteBtn = document.getElementById('save-note-btn');
    const noteList = document.getElementById('note-list');
    const noteDateInput = document.getElementById('note-date-input');

    // Función segura para cargar datos desde localStorage
    const getStoredData = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error al parsear los datos de '${key}':`, error);
            return []; // Devuelve un array vacío si hay un error
        }
    };

    let contacts = getStoredData('contacts');
    let tasks = getStoredData('tasks');
    let notes = getStoredData('notes');

    const saveContacts = () => localStorage.setItem('contacts', JSON.stringify(contacts));
    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));
    const saveNotes = () => localStorage.setItem('notes', JSON.stringify(notes));

    const renderContacts = () => {
        contactList.innerHTML = '';
        contacts.forEach((contact, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${contact.name} - ${contact.phone} - ${contact.email}</span>
                <button class="delete-btn" data-index="${index}">Eliminar</button>
            `;
            contactList.appendChild(li);
        });
    };

    const renderTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            const dateHtml = task.date ? `<span class="item-date">${task.date}</span>` : '';
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                ${dateHtml}
                <div class="task-actions">
                    <button class="complete-btn" data-index="${index}">${task.completed ? 'Deshacer' : 'Completar'}</button>
                    <button class="delete-btn" data-index="${index}">Eliminar</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    };

    const renderNotes = () => {
        noteList.innerHTML = '';
        notes.forEach((note, index) => {
            const li = document.createElement('li');
            const dateHtml = note.date ? `<span class="item-date">${note.date}</span>` : '';
            li.innerHTML = `
                <button class="delete-note-btn" data-index="${index}">Eliminar</button>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <h3 class="note-title-text">${note.title}</h3>
                    ${dateHtml}
                </div>
                <div class="note-content">${note.content}</div>
            `;
            noteList.appendChild(li);
        });
    };

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newContact = { name: nameInput.value, phone: phoneInput.value, email: emailInput.value };
        contacts.push(newContact);
        saveContacts();
        renderContacts();
        contactForm.reset();
    });

    contactList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.getAttribute('data-index');
            contacts.splice(index, 1);
            saveContacts();
            renderContacts();
        }
    });

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = { text: taskInput.value, completed: false, date: taskDateInput.value };
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        taskForm.reset();
        taskDateInput.value = '';
    });

    taskList.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (e.target.classList.contains('delete-btn')) {
            tasks.splice(index, 1);
        }
        if (e.target.classList.contains('complete-btn')) {
            tasks[index].completed = !tasks[index].completed;
        }
        saveTasks();
        renderTasks();
    });

    // --- Lógica de Notas (reescrita) ---

    // 1. Lógica de la barra de herramientas
    toolbar.addEventListener('click', (e) => {
        const command = e.target.dataset.command;
        if (command) {
            e.preventDefault();
            document.execCommand(command, false, null);
            noteContent.focus();
        }
    });

    // 2. Permitir anidar con la tecla Tab
    noteContent.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand(e.shiftKey ? 'outdent' : 'indent', false, null);
        }
    });
    
    // 3. Guardar la nota (actualizado)
    saveNoteBtn.addEventListener('click', () => {
        const title = noteTitle.value.trim();
        const content = noteContent.innerHTML.trim();
        if (!title) {
            alert('Por favor, ingresa un título para el tema.');
            return;
        }
        const date = noteDateInput.value;
        notes.push({ title, content, date });
        saveNotes();
        renderNotes();

        // Limpiar editor
        noteTitle.value = '';
        noteDateInput.value = '';
        noteContent.innerHTML = '';
    });

    noteList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-note-btn')) {
            const index = e.target.getAttribute('data-index');
            if (confirm('¿Estás seguro de que quieres eliminar esta nota?')) {
                notes.splice(index, 1);
                saveNotes();
                renderNotes();
            }
        }
    });

    // --- Carga Inicial ---
    renderContacts();
    renderTasks();
    renderNotes();

    // --- Registrar Service Worker para PWA ---
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Service Worker registrado', reg))
            .catch(err => console.error('Error al registrar Service Worker', err));
    }
}); 