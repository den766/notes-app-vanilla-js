// const inputTitle = document.querySelector("#title");
// const inputBody = document.querySelector("#content");
// const inputAuthor = document.querySelector("#author");
// const addNoteBtn = document.querySelector("#save-btn");
// const noteslist = document.querySelector("#notes-list");

// let notes = [];

// const generateId = () => {
//   return Date.now().toString() + Math.random().toString(36).slice(2);
// };

// const formatText = (txt, auth) => {
//   let formatTxt = txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
//   let formatAuth = auth.charAt(0).toUpperCase() + auth.slice(1).toLowerCase();
// };

// const duplicate = (txt, auth) => {
//   notes.some((t) => t.text === txt && t.author !== auth);
// };

// const validateText = (txt, auth, body) => {
//   if (!txt) return "Title cannot be empty";
//   if (txt.length < 4) return "title must be longer than 3 characters";

//   if (!auth) return "author cannot be empty";
//   if (auth.length < 3) return "author must be longer than 3 characters";

//   if (!body) return "note field cannot be empty";
//   if (body.length < 10)
//     return "note field must contain more than 10 characters";

//   //   duplicate(txt, auth);

//   //   if (duplicate) return "Task must be unique";

//   return null;
// };

// const render = () => {
//   console.log(notes);
// };

// const createNote = () => {
//   let titleText = inputTitle.value.trim();
//   let authorText = inputAuthor.value.trim();
//   let bodyText = inputBody.value.trim();

//   let finalTxt = formatText(titleText);
//   let finalAuth = formatText(authorText);
//   const inputError = validateText(finalTxt, finalAuth, bodyText);
//   if (inputError) return alert(inputError);

//   notes = [
//     ...notes,
//     {
//       id: generateId(),
//       title: titleText,
//       author: authorText,
//       body: bodyText,
//       createdAt: new Date().toISOString(),
//     },
//   ];

//   (titleText, bodyText, (authorText.value = ""));
//   render();
// };

// addNoteBtn.addEventListener("click", createNote);

const inputTitle = document.querySelector("#title");
const inputBody = document.querySelector("#content");
const inputAuthor = document.querySelector("#author");
const addNoteBtn = document.querySelector("#save-btn");
const noteslist = document.querySelector("#notes-list");

let notes = [];

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
    .map(({ id, title, author, body }) => {
      return `<li class="note">
          <div class="note-title">${title}</div>
          <div class="note-author">author :${author}</div>
          <div>${body}</div>

          <div class="note-actions">
            <button class="edit-btn" data-id="${id}">Edit</button>
            <button class="delete-btn" data-id="${id}">Delete</button>
          </div>
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

addNoteBtn.addEventListener("click", createNote);

noteslist.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;

    console.log("operation commpleted");

    render();
  }
});
