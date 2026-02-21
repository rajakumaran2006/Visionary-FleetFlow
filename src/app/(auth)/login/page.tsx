import Link from 'next/link'
import { login } from '../actions'
import styles from '../auth.module.css'
import { Github, Facebook, Mail, Lock } from 'lucide-react'

// Simple SVG for Google
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <>
      <h2 className={styles.title}>Sign in</h2>
      
      {params?.error && <div className={styles.formError}>{params.error}</div>}
      {params?.message && <div className={styles.formSuccess}>{params.message}</div>}

      <form action={login}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email Address</label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} size={18} />
            <input className={styles.input} id="email" name="email" type="email" placeholder="johndoe@gmail.com" required />
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">Password</label>
          <div className={styles.inputWrapper}>
            <Lock className={styles.inputIcon} size={18} />
            <input className={styles.input} id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
        </div>

        <div className={styles.formOptions}>
          <label className={styles.checkbox}>
            <input type="checkbox" name="remember" />
            Remember me
          </label>
        </div>

        <button className={styles.submitBtn} type="submit">Sign in</button>
      </form>

      <div className={styles.signupAction}>
        <div className={styles.signupHint}>
          Don&apos;t have an account? <Link href="/register" className={styles.signupLink}>Sign up</Link>
        </div>
        <Link href="/forgot-password" className={styles.forgotLink}>
            Forgot Password
        </Link>
      </div>

      <div className={styles.socialRow}>
        <button className={styles.socialBtn} type="button">
          <GoogleIcon />
        </button>
        <button className={styles.socialBtn} type="button">
          <Github size={24} />
        </button>
        <button className={styles.socialBtn} type="button">
          <Facebook size={24} color="#1877F2" />
        </button>
      </div>
    </>
  )
}
