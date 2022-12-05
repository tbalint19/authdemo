import { useEffect } from "react"
import { useState } from "react"
import http from "axios"

const App = () => {

  const [ loggedInUserId, setLoggedInUserId ] = useState(null)

  const [ page, setPage ] = useState("signup")
  const [ posts, setPosts ] = useState(null)
  const [ username, setUsername ] = useState("")
  const [ password, setPassword ] = useState("")
  const [ content, setContent ] = useState("")

  const signup = async () => {
    const response = await http.post("http://localhost:3000/api/signup", { username, password })
  }

  const login = async () => {
    try {
      const response = await http.post("http://localhost:3000/api/login", { username, password })
      return response.data.sessionId
    } catch (error) {
      return null
    }
  }

  const loadPosts = async (sessionId) => {
    const response = await http.get("http://localhost:3000/api/post", {
      headers: { "authorization": sessionId || loggedInUserId }
    })
    setPosts(response.data)
  }

  const savePost = async () => {
    const response = await http.post("http://localhost:3000/api/post", {
      content
    }, {
      headers: { "authorization": loggedInUserId }
    })
  }

  const signupHandler = async () => {
    await signup()
    setUsername("")
    setPassword("")
    alert("Signup done")
    setPage("login")
  }

  const loginHandler = async () => {
    const userId = await login()
    if (!userId) {
      return alert("Wrong credentials")
    }
    localStorage.setItem("sessionId", userId)
    setLoggedInUserId(userId)
    setUsername("")
    setPassword("")
    alert("Login done")
    setPage("post")
    loadPosts(userId)
  }

  const postHandler = async () => {
    await savePost()
    loadPosts()
    setContent("")
  }

  const logoutHandler = () => {
    setLoggedInUserId(null)
    localStorage.removeItem("sessionId")
    setPage("login")
  }

  useEffect(() => {
    const userId = localStorage.getItem("sessionId")
    if (userId) {
      setLoggedInUserId(userId)
      setPage("post")
      loadPosts(userId)
    }
  }, [])

  return (
    <div className="App">
      { page === "signup" && (
        <main>
          <p>Signup</p>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}/>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}/>
          <button onClick={signupHandler}>Signup</button>
          <button onClick={() => setPage("login")}>To login</button>
        </main>)}
      
      { page === "login" && (
        <main>
          <p>Login</p>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}/>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}/>
          <button onClick={loginHandler}>Login</button>
          <button onClick={() => setPage("signup")}>To signup</button>
        </main>)}

      { page === "post" && (
        <main>
          <input
            type="text"
            placeholder="Content"
            value={content}
            onChange={e => setContent(e.target.value)} />
          <button onClick={postHandler}>Post</button>
          <button onClick={logoutHandler}>Logout</button>
          <hr />
          {posts && posts.map(post => (
            <div key={post}>{post}</div>
          ))}
        </main>)}
    </div>
  )
}

export default App
