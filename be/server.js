const express = require('express')
const cors = require('cors')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const app = express()
const port = 3000

app.use(cors())
app.use(express.json())

const mySecretKey = 5

const signedByMe = (str) => {

    /* const abc = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz"
  
    let signature = ""
    for (const letter of str) {
      const indexInAbc = abc.indexOf(letter)
      signature += abc[indexInAbc + mySecretKey]
    }
  
    return str + "::" + signature */
    const signed = jwt.sign({uid: str}, mySecretKey.toString(), { expiresIn: '1h' })
    return signed
}

const verifyByMe = (str) => {
    /* const payload = str.split("::")[0]
    const signature = str.split("::")[1]

    const abc = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz"
    let original = ""
    for (const letter of signature) {
        const indexInAbc = abc.indexOf(letter)
        original += abc[26 + indexInAbc - mySecretKey]
    }

    return { isValid: original === payload, payload: original } */
    const result = jwt.verify(str, mySecretKey.toString())
    return { isValid: !!result.uid, payload: result.uid } 
}

app.post("/api/signup", (req, res) => {
  const username = req.body.username
  const password = req.body.password
  const userId = Math.random().toString()

  const database = fs.readFileSync('./database.json')
  const users = JSON.parse(database)
  users.push({ userId, username, password, posts: [] })
  fs.writeFileSync('./database.json', JSON.stringify(users, null, 2))

  res.sendStatus(200)
})

app.post("/api/login", (req, res) => {
  const username = req.body.username
  const password = req.body.password

  const database = fs.readFileSync('./database.json')
  const users = JSON.parse(database)
  
  const user = users.find(user => user.username === username && user.password === password)
  if (!user) {
    return res.sendStatus(401)
  }

  const sessionId = signedByMe(user.username)

  res.json({ sessionId: sessionId })
})

app.get('/api/post', (req, res) => {
  const userId = req.header("authorization")
  console.log(userId)
  const result = verifyByMe(userId)
  if (!result.isValid) {
    return res.sendStatus(403)
  }

  const database = fs.readFileSync('./database.json')
  const users = JSON.parse(database)
  const user = users.find(user => user.username === result.payload)
  if (!user) {
    return res.sendStatus(401)
  }

  res.json(user.posts)
})

app.post('/api/post', (req, res) => {
  const content = req.body.content
  const userId = req.header("authorization")
  const result = verifyByMe(userId)
  if (!result.isValid) {
    return res.sendStatus(403)
  }

  const database = fs.readFileSync('./database.json')
  const users = JSON.parse(database)
  fs.writeFileSync('./database.json', JSON.stringify(users
    .map(user => user.username !== result.payload ? user : { ...user, posts: [ ...user.posts, content] })
    , null, 2))

  res.sendStatus(200)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})