const inputTitle = document.querySelector("#title");
const inputBody = document.querySelector("#content");
const inputAuthor = document.querySelector("#author");
const addNoteBtn = document.querySelector("#save-btn");
const noteslist = document.querySelector("#notes-list");
const searchInput = document.querySelector("#search");
const errorBox = document.querySelector("#error-message");

let notes = [];
let editingId = null;
let searchQuery = "";

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).slice(2);

// -----------------------------
// Local Storage
// -----------------------------

const saveNotes = (notes) => {
  const ConvertedNotes = JSON.stringify(notes);
  localStorage.setItem("notes", ConvertedNotes);
};

const loadNotes = () => {
  const saved = localStorage.getItem("notes");
  if (saved) {
    notes = JSON.parse(saved);
  }
};

// -----------------------------
// Date Formatter
// -----------------------------

const formatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "short",
  timeStyle: "medium",
  timeZone: "Asia/Kolkata",
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return "Unknown date";
  return formatter.format(date);
};

const showError = (message) => {
  errorBox.textContent = message;
};

const cancelError = () => {
  errorBox.textContent = "";
};

// -----------------------------
// SANITIZE INPUT
// -----------------------------

const sanitize = (txt) => txt.trim();

// -----------------------------
// FORMATTERS
// -----------------------------

const formatTitle = (title) => {
  return title.charAt(0).toUpperCase() + title.slice(1).toLowerCase();
};

const formatAuthor = (author) => {
  return author
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// -----------------------------
// VALIDATION RULES
// -----------------------------

const validateTitle = (title) => {
  if (!title) return "Title cannot be empty";

  if (title.length < 4) return "Title must be at least 4 characters";

  if (title.length > 80) return "Title cannot exceed 80 characters";

  if (title.includes("\n")) return "Title cannot contain paragraphs";

  return null;
};

const validateAuthor = (author) => {
  if (!author) return "Author cannot be empty";

  if (author.length < 3) return "Author must be at least 3 characters";

  if (author.length > 40) return "Author name too long";

  return null;
};

const validateBody = (body) => {
  if (!body) return "Note content cannot be empty";

  if (body.length < 10) return "Note must contain at least 10 characters";

  if (body.length > 2000) return "Note too long";

  return null;
};

// -----------------------------
// DUPLICATE CHECK
// -----------------------------

const isDuplicate = (title, author) => {
  return notes.some((note) => note.title === title && note.author === author);
};

const render = () => {
  let visibleNotes = notes;
  visibleNotes.sort((a, b) => b.pinned - a.pinned);

  if (searchQuery) {
    visibleNotes = visibleNotes.filter(
      ({ title, author, body }) =>
        title.toLowerCase().includes(searchQuery) ||
        author.toLowerCase().includes(searchQuery) ||
        body.toLowerCase().includes(searchQuery),
    );
  }

  if (visibleNotes.length === 0) {
    noteslist.innerHTML = `
    <div class="empty-message">
      <div class="empty-icon">📝</div>
      <h3>${searchQuery ? "No results found" : "No notes yet"}</h3>
      <p>${
        searchQuery
          ? "Try a different keyword."
          : "Create your first note to get started."
      }</p>
    </div>
  `;
    return;
  }

  noteslist.innerHTML = visibleNotes
    .map(({ id, title, author, body, createdAt, pinned }) => {
      if (editingId === id) {
        return `<li class="note-editing">
        <input class="title-edit-input" value="${title}"/>
        <input class="author-edit-input" value="${author}" />
        <textarea class="body-edit-input">${body}</textarea>
        <button data-action="save" data-id="${id}">Save</button>
        <button  data-action="cancel">Cancel</button>
        </li>
        
        
        `;
      }
      return `<li class="note ${pinned ? "pinned" : ""}">
          <div class="note-title">${title}</div>
          <div class="note-author">${author}</div>
          <div>${body}</div>

          <div class="note-actions">
            <button class="edit-btn" data-id="${id}">Edit</button>
            <button class="delete-btn" data-id="${id}">Delete</button>
            ${
              pinned
                ? `<button class="unpin-btn" data-id="${id}">Unpin</button>`
                : `<button class="pin-btn" data-id="${id}">Pin</button>`
            }
            
          </div>
          <div class="formatDate">${formatDate(createdAt)}</div>
        </li>`;
    })
    .join("");
};

// -----------------------------
// CREATE NOTE
// -----------------------------

const createNote = () => {
  let rawTitle = inputTitle.value;
  let rawAuthor = inputAuthor.value;
  let rawBody = inputBody.value;

  const title = formatTitle(sanitize(rawTitle));
  const author = formatAuthor(sanitize(rawAuthor));
  const body = sanitize(rawBody);

  if (isDuplicate(title, author))
    return showError("Note already exists for this author");

  const titleError = validateTitle(title);
  if (titleError) {
    showError(titleError);
    return;
  }

  const authorError = validateAuthor(author);
  if (authorError) {
    showError(authorError);
    return;
  }

  const bodyError = validateBody(body);
  if (bodyError) {
    showError(bodyError);
    return;
  }

  cancelError();

  const note = {
    id: generateId(),
    title,
    author,
    body,
    createdAt: new Date().toISOString(),
    pinned: false,
  };

  notes = [...notes, note];

  saveNotes(notes);

  console.log(notes);

  inputTitle.value = "";
  inputAuthor.value = "";
  inputBody.value = "";

  render();
};

// -----------------------------
// Delete Note
// -----------------------------

const deleteNote = (curid) => {
  notes = notes.filter(({ id }) => id !== curid);
  if (editingId === curid) {
    editingId = null;
  }
  saveNotes(notes);
  render();
};

// -----------------------------
// Edit note
// -----------------------------

const startEdit = (id) => {
  editingId = id;
  render();
};

const cancelEdit = () => {
  editingId = null;
  render();
};

const saveEdit = (id, title, author, body) => {
  const cleanTitle = formatTitle(sanitize(title));
  const cleanAuthor = formatAuthor(sanitize(author));
  const cleanBody = sanitize(body);

  const editedTitleError = validateTitle(cleanTitle);
  if (editedTitleError) {
    showError(editedTitleError);
    return;
  }

  const editedAuthorError = validateAuthor(cleanAuthor);
  if (editedAuthorError) {
    showError(editedAuthorError);
    return;
  }

  const editedBodyError = validateBody(cleanBody);
  if (editedBodyError) {
    showError(editedBodyError);
    return;
  }

  cancelError();

  notes = notes.map((note) =>
    note.id === id
      ? { ...note, title: cleanTitle, author: cleanAuthor, body: cleanBody }
      : note,
  );

  editingId = null;
  saveNotes(notes);
  render();
};

// -----------------------------
// Search Notes
// -----------------------------

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.trim().toLowerCase();
  render();
});

// -----------------------------
// Pin & unPin Notes
// -----------------------------

const pinNote = (pinId) => {
  let pinnedCount = notes.filter((note) => note.pinned).length;
  if (pinnedCount >= 2) {
    showError("You can only pin upto 2 notes");
    return;
  }

  cancelError();

  notes = notes.map((note) =>
    note.id === pinId ? { ...note, pinned: true } : note,
  );
  saveNotes(notes);
  render();
};

const unpinNote = (pinId) => {
  notes = notes.map((note) =>
    note.id === pinId ? { ...note, pinned: false } : note,
  );

  saveNotes(notes);
  render();
};

addNoteBtn.addEventListener("click", createNote);

// -----------------------------
// Event Delegation
// -----------------------------

noteslist.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;

    deleteNote(id);
  }

  if (e.target.classList.contains("edit-btn")) {
    const id = e.target.dataset.id;

    startEdit(id);
  }
  if (e.target.dataset.action === "cancel") {
    cancelEdit();
  }

  if (e.target.dataset.action === "save") {
    const id = e.target.dataset.id;

    const li = e.target.closest("li");

    const title = li.querySelector(".title-edit-input").value;
    const author = li.querySelector(".author-edit-input").value;
    const body = li.querySelector(".body-edit-input").value;
    saveEdit(id, title, author, body);
  }

  if (e.target.classList.contains("pin-btn")) {
    const id = e.target.dataset.id;
    pinNote(id);
  }

  if (e.target.classList.contains("unpin-btn")) {
    const id = e.target.dataset.id;
    unpinNote(id);
  }
});

loadNotes();
render();
