import Link from 'next/link'
import { resetPassword } from '../actions'
import styles from '../auth.module.css'
import { Mail } from 'lucide-react'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams

  return (
    <>
      <h2 className={styles.title}>Reset your password</h2>
      <p className={styles.signupHint} style={{ marginBottom: '2rem' }}>
        Enter your email address and we&apos;ll send you a link to reset your password.
      </p>
      
      {params?.error && <div className={styles.formError}>{params.error}</div>}
      {params?.message && <div className={styles.formSuccess}>{params.message}</div>}

      <form action={resetPassword}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email Address</label>
          <div className={styles.inputWrapper}>
            <Mail className={styles.inputIcon} size={18} />
            <input className={styles.input} id="email" name="email" type="email" placeholder="johndoe@gmail.com" required />
          </div>
        </div>

        <button className={styles.submitBtn} type="submit">Send Reset Link</button>
      </form>

      <div className={styles.signupAction}>
        <div className={styles.signupHint}>
          Remember your password? <Link href="/login" className={styles.signupLink}>Return to sign in</Link>
        </div>
      </div>
    </>
  )
}
