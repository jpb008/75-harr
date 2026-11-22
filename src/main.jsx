import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import FriendView from './components/FriendView.jsx'
import './index.css'

// ?friend=TOKEN opens the read-only accountability page (no login).
const friendToken = new URLSearchParams(window.location.search).get('friend')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {friendToken ? <FriendView token={friendToken} /> : <App />}
  </React.StrictMode>,
)
