import styles from '../styles/Nav.module.css'
import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/router';
import { useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

export default function Nav() {
  const { data: sessionData } = useSession();
  const [dropDownVisible, setDropDownVisible] = useState(false)

  const router = useRouter()

  const handleDropDown = () => {
    setDropDownVisible(!dropDownVisible)
  }

    return (
        <nav>
            <div className={styles.container}>
                <Image src='/devchallenges.svg' alt='logo' width={130} height={100} ></Image>
                <div className={styles.dropDownContainer}>
                    <div className={styles.dropDownMain} onClick={handleDropDown}>
                    <img src={sessionData?.user.image} alt="" />
                    <p>{sessionData ? sessionData?.user.name : 'Not logged in'}</p>
                    {dropDownVisible ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    </div>
                    {dropDownVisible && <ul>
                        <li onClick={() => void router.push('/')}><AccountCircleIcon />  Profile</li>
                        <li className={styles.signBtn} onClick={sessionData ? () => void signOut() : () => void signIn()}>{sessionData ? <LogoutIcon /> : <LoginIcon /> } {sessionData ? 'Logout' : 'Login'}</li>
                    </ul>}
                </div>
            </div>
        </nav>
    )
}