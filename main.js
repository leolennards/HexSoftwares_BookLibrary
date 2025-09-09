const bookForm = document.getElementById("bookForm");
const bookList = document.getElementById("bookList");
const borrowedList = document.getElementById("borrowedList");
const searchInput = document.getElementById("search");
const statsDiv = document.getElementById("stats");
const randomBookBtn = document.getElementById("randomBook");
const toggleDark = document.getElementById("toggleDark");

// Set initial state
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
  toggleDark.checked = true;
} else {
  toggleDark.checked = false;
}

toggleDark.onchange = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
};

// Notification
function showNotification(msg) {
  let notif = document.getElementById("notification");
  if (!notif) {
    notif = document.createElement("div");
    notif.id = "notification";
    notif.style.position = "fixed";
    notif.style.top = "20px";
    notif.style.left = "50%";
    notif.style.transform = "translateX(-50%)";
    notif.style.background = "#1c92d2";
    notif.style.color = "#fff";
    notif.style.padding = "10px 20px";
    notif.style.borderRadius = "5px";
    notif.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
    notif.style.zIndex = "1000";
    document.body.appendChild(notif);
  }
  notif.textContent = msg;
  notif.style.display = "block";
  setTimeout(() => (notif.style.display = "none"), 1500);
}

let library = JSON.parse(localStorage.getItem("library")) || [];
let borrowed = JSON.parse(localStorage.getItem("borrowed")) || [];

// Save to localStorage
function saveData() {
  localStorage.setItem("library", JSON.stringify(library));
  localStorage.setItem("borrowed", JSON.stringify(borrowed));
}

// Highlight search term
function highlight(text, term) {
  if (!term) return text;
  const regex = new RegExp(`(${term})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

// Display stats
function renderStats() {
  statsDiv.innerHTML = `
    <b>Total Books:</b> ${library.length + borrowed.length} &nbsp; | &nbsp;
    <b>Available:</b> ${library.length} &nbsp; | &nbsp;
    <b>Borrowed:</b> ${borrowed.length}
  `;
}

// Display books
function renderBooks(filter = "") {
  renderStats();

  // Library
  bookList.innerHTML = "";
  library
    .filter((book) => book.title.toLowerCase().includes(filter) || book.author.toLowerCase().includes(filter) || book.category.toLowerCase().includes(filter))
    .forEach((book, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        ${book.cover ? `<img src="${book.cover}" alt="cover" onerror="this.style.display='none'">` : ""}
        <span>
          <b>${highlight(book.title, filter)}</b><br>
          <small>${highlight(book.author, filter)} &middot; <i>${highlight(book.category, filter)}</i></small>
        </span>
        <div class="actions">
          <button class="borrow">Borrow</button>
          <button class="edit">Edit</button>
          <button class="delete">Delete</button>
        </div>
      `;
      li.querySelector(".borrow").onclick = () => {
        borrowed.push(book);
        library.splice(index, 1);
        saveData();
        renderBooks(searchInput.value.toLowerCase());
        showNotification("Book borrowed!");
      };
      li.querySelector(".delete").onclick = () => {
        library.splice(index, 1);
        saveData();
        renderBooks(searchInput.value.toLowerCase());
        showNotification("Book deleted!");
      };
      li.querySelector(".edit").onclick = () => editBook(book, index, false);
      bookList.appendChild(li);
    });

  // Borrowed
  borrowedList.innerHTML = "";
  borrowed.forEach((book, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${book.cover ? `<img src="${book.cover}" alt="cover" onerror="this.style.display='none'">` : ""}
      <span>
        <b>${book.title}</b><br>
        <small>${book.author} &middot; <i>${book.category}</i></small>
      </span>
      <div class="actions">
        <button class="return">Return</button>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </div>
    `;
    li.querySelector(".return").onclick = () => {
      library.push(book);
      borrowed.splice(index, 1);
      saveData();
      renderBooks(searchInput.value.toLowerCase());
      showNotification("Book returned!");
    };
    li.querySelector(".delete").onclick = () => {
      borrowed.splice(index, 1);
      saveData();
      renderBooks(searchInput.value.toLowerCase());
      showNotification("Book deleted!");
    };
    li.querySelector(".edit").onclick = () => editBook(book, index, true);
    borrowedList.appendChild(li);
  });
}

// Edit book
function editBook(book, index, isBorrowed) {
  const newTitle = prompt("Edit Title:", book.title);
  if (newTitle === null) return;
  const newAuthor = prompt("Edit Author:", book.author);
  if (newAuthor === null) return;
  const newCategory = prompt("Edit Category:", book.category);
  if (newCategory === null) return;
  const newCover = prompt("Edit Cover URL (optional):", book.cover || "");
  const updated = { title: newTitle, author: newAuthor, category: newCategory, cover: newCover };
  if (isBorrowed) {
    borrowed[index] = updated;
  } else {
    library[index] = updated;
  }
  saveData();
  renderBooks(searchInput.value.toLowerCase());
  showNotification("Book updated!");
}

// Add book
bookForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const author = document.getElementById("author").value.trim();
  const category = document.getElementById("category").value.trim();
  const cover = document.getElementById("cover").value.trim();
  if (!title || !author || !category) return;
  library.push({ title, author, category, cover });
  saveData();
  renderBooks(searchInput.value.toLowerCase());
  bookForm.reset();
  showNotification("Book added!");
});

// Search filter
searchInput.addEventListener("input", () => {
  renderBooks(searchInput.value.toLowerCase());
});

// Random book suggestion
randomBookBtn.onclick = () => {
  if (library.length === 0) {
    showNotification("No books to suggest!");
    return;
  }
  const idx = Math.floor(Math.random() * library.length);
  const book = library[idx];
  showNotification(`Try: "${book.title}" by ${book.author}`);
};

// Initial render
renderBooks();
