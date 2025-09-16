import React, { useState } from 'react'

const initialBooks = [
  { id: 1, title: '1984', author: 'George Orwell' },
  { id: 2, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
  { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee' }
]

export default function App() {
  const [books, setBooks] = useState(initialBooks)
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')

  // filter books by title or author (case-insensitive)
  const filtered = books.filter(b => {
    const q = query.trim().toLowerCase()
    if (q === '') return true
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    )
  })

  function addBook(e) {
    e.preventDefault()
    const t = title.trim()
    const a = author.trim()
    if (!t || !a) return alert('Please enter both title and author.')
    const newBook = { id: Date.now(), title: t, author: a }
    setBooks(prev => [newBook, ...prev])
    setTitle('')
    setAuthor('')
  }

  function removeBook(id) {
    setBooks(prev => prev.filter(b => b.id !== id))
  }

  return (
    <div className="container">
      <h1>Library Management</h1>

      <div className="controls">
        <input
          className="search"
          placeholder="Search by title or author"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <form className="add-form" onSubmit={addBook}>
        <input
          placeholder="New book title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <input
          placeholder="New book author"
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
        <button type="submit">Add Book</button>
      </form>

      <div className="book-list">
        {filtered.length === 0 ? (
          <p className="no-results">No books found.</p>
        ) : (
          filtered.map(book => (
            <div key={book.id} className="book">
              <div className="book-info">
                <strong>{book.title}</strong>
                <span className="by"> by </span>
                <span className="author">{book.author}</span>
              </div>
              <button className="remove" onClick={() => removeBook(book.id)}>
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}