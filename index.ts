import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, query, validationResult } from 'express-validator'

const app = express()
app.use(bodyParser.json())
app.use(cors())

const PORT = process.env.PORT || 3000
const SECRET = "SIMPLE_SECRET"

interface JWTPayload {
  username: string;
  password: string;
  code: string;
  firstname: string;
  lastname: string;
  balance: Int16Array;
  gpa : Int16Array;
}

  app.post<any, any, LoginArgs>('/login', async (req, res) => {
    const { username, password } = req.body
  
    const user = await User.findOne({ where: { username } })
    const userAttrs = user?.get()
  
    if (!userAttrs || !bcrypt.compareSync(password, userAttrs.password)) {
      res.status(400)
      res.json({ message: 'Invalid username or password' })
      return
    }
    const token = jwt.sign(
      { id: userAttrs.id, username: userAttrs.username } as JWTPayload, SECRET_KEY
    )
    return res.status(200).json({
      "message": "Login successfully",
      "token": "token ที่ระบบสร้างขึ้น"
    }
    )
  })
  type RegisterArgs = Omit<UserModel, 'id'>

  app.post<any, any, RegisterArgs>('/register', 
  body('username').isString(),
  body('password').isString(),
  body('firstname').isString(),
  body('lastname').isString(),
  body('balance').isInt,
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      res.status(400)
      res.json(errors)
      return
    }

    req.body.password = bcrypt.hashSync(req.body.password, 10)
    try {
      const user = await User.create(req.body)
      res.status(200)
      res.json({ "message": "Register successfully" })
    } catch (e) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        res.status(400)
        res.json({"message": "Username is already in used"})
      }

      res.status(500)
      res.json({ message: 'Internal server error' })
    }
  })

app.get('/balance', async (req, res) => {
    const token = req.query.token as string
    try {
      const { username } = jwt.verify(token, SECRET) as JWTPayload
      res.status(200)
      res.json({
        "name": 'name',
        "balance": 'balance'
      }
      )
    }
    catch (e) {
      //response in case of invalid token
      res.status(401)
      res.json({ "message": "Invalid token" })
    }
  })

app.post('/deposit',
  body('amount').isInt({ min: 1 }),
  (req, res) => {

    //Is amount <= 0 ?
    if (!validationResult(req).isEmpty())
      return res.status(400).json({ message: "Invalid data" })
  })

app.post('/withdraw',
  (req, res) => {
  })

app.delete('/reset', (req, res) => {

  //code your database reset here
  
  return res.status(200).json({
    message: 'Reset database successfully'
  })
})

app.get('/me', (req, res) => {
  return res.status(200).json({
  "firstname": 'firstname',
  "lastname" : 'lastname',
  "code" : 'code',
  "gpa" : 'gpa'
})

})

app.get('/demo', (req, res) => {
  return res.status(200).json({
    message: 'This message is returned from demo route.'
  })
})

app.listen(PORT, () => console.log(`Server is running at ${PORT}`))