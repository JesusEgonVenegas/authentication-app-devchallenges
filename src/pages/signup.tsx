import { useState } from 'react'
import { useRouter } from 'next/router'
import styles from "../styles/Signup.module.css"
import devChallengesLogo from "../../public/devchallenges.svg"
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next'
import { authOptions } from '~/server/auth'
import { getProviders, signIn } from 'next-auth/react'
import githubPic from "../../public/Gihub.svg"

export default function Signup({providers}:InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, phone }),
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.ok) {
    //   router.push('/dashboard') // Redirect to dashboard or any other page
        router.push('/')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
      <Image src={devChallengesLogo} alt="logo" />
      <p>Join thousands of learners from around the world</p>
      <p>Master web development by making real-life projects. There are mulutiple paths for you to choose</p>
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button className={styles.loginButton} type="submit">Start coding now</button>
    </form>
    <p>or continue with these social profile</p>

    {/* Providers part  */}

    <div className={styles.socialContainer} >
            {Object.values(providers).map((provider) => {
                if (provider.name != "Credentials") return (
                    <div  key={provider.name}>
                        <button onClick={() => signIn(provider.id)}>
                            <Image src={githubPic} alt="github" width="45" height="45" />
                        </button>
                    </div>
                )
            })}
                </div>
    

    <p>Already a member? <a href="/signin">Login</a></p>
    </div>
    <p>created by username</p>
    <p>devChallenges.io</p>
</div>
  )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
    const session = await getServerSession(context.req, context.res, authOptions);

    if (session) {
        return { redirect: { destination: "/" } }
    }

    const providers = await getProviders();

    return {
        props: {
            providers: providers ?? [],
        },
    }
}