import { updatePassword } from '../actions'
import styles from '../auth.module.css'

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <>
      <h2 className={styles.title}>Update Password</h2>
      <p className={styles.signupHint} style={{ marginBottom: '2rem' }}>
        Enter your new password below.
      </p>
      
      {params?.error && <div className={styles.formError}>{params.error}</div>}

      <form action={updatePassword}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">New Password</label>
          <input className={styles.input} id="password" name="password" type="password" placeholder="••••••••" required minLength={6} />
        </div>

        <button className={styles.submitBtn} type="submit">Update Password</button>
      </form>
    </>
  )
}
