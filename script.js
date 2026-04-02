const inputTitle = document.querySelector("#title");
const inputBody = document.querySelector("#content");
const inputAuthor = document.querySelector("#author");
const addNoteBtn = document.querySelector("#save-btn");
const noteslist = document.querySelector("#notes-list");

let notes = [];
let editingId = null;

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).slice(2);

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
  return notes.some((note) => note.title === title || note.author === author);
};

const render = () => {
  noteslist.innerHTML = notes
    .map(({ id, title, author, body, createdAt }) => {
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
      return `<li class="note">
          <div class="note-title">${title}</div>
          <div class="note-author">author :${author}</div>
          <div>${body}</div>

          <div class="note-actions">
            <button class="edit-btn" data-id="${id}">Edit</button>
            <button class="delete-btn" data-id="${id}">Delete</button>
            
          </div>
          <div class="createdAt"><p>${createdAt}<p></div>
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
    return alert("Note already exists for this author");

  const titleError = validateTitle(title);
  if (titleError) return alert(titleError);

  const authorError = validateAuthor(author);
  if (authorError) return alert(authorError);

  const bodyError = validateBody(body);
  if (bodyError) return alert(bodyError);

  const note = {
    id: generateId(),
    title,
    author,
    body,
    createdAt: new Date().toISOString(),
  };

  notes = [...notes, note];

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
  const editedTitleError = validateTitle(title);
  if (editedTitleError) return alert(editedTitleError);

  const editedAuthorError = validateAuthor(author);
  if (editedAuthorError) return alert(editedAuthorError);

  const editedBodyError = validateBody(body);
  if (editedBodyError) return alert(editedBodyError);

  notes = notes.map((note) =>
    note.id === id
      ? { ...note, title: title, author: author, body: body }
      : note,
  );

  editingId = null;
  render();
};

addNoteBtn.addEventListener("click", createNote);

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
});
