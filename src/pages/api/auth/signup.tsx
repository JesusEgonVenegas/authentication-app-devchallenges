import { prisma } from "~/server/db";
import { NextApiRequest, NextApiResponse } from 'next';

interface SignupRequestBody {
  email: string;
  password: string;
  name: string;
  phone: string;
}

export default async function signup(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
  const { email, password, name, phone }: SignupRequestBody = req.body as SignupRequestBody;


  try {
    // Check if the email already exists in the database
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      res.status(400).json({ message: 'Email already exists' })
      return
    }

    // Create the user in the database
    const newUser = await prisma.user.create({ data: { email, password, name, phone } })

    // Return the newly created user
    res.status(200).json(newUser)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to create user' })
  }

  } else {
    res.status(405).end()
  }
}
