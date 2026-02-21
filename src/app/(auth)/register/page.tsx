import Link from 'next/link'
import { signup } from '../actions'
import styles from '../auth.module.css'
import { User, Mail, Lock, Settings } from 'lucide-react'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <>
      <h2 className={styles.title}>Create account</h2>
      
      {params?.error && <div className={styles.formError}>{params.error}</div>}

      <form action={signup}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="full_name">Full Name</label>
          <div className={styles.inputWrapper}>
             <User className={styles.inputIcon} size={18} />
             <input className={styles.input} id="full_name" name="full_name" type="text" placeholder="John Doe" required />
          </div>
        </div>

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

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="role">Select Role</label>
          <div className={styles.inputWrapper}>
             <Settings className={styles.inputIcon} size={18} />
             <select className={styles.select} id="role" name="role" required>
               <option value="manager">Fleet Manager</option>
               <option value="dispatcher">Dispatcher</option>
               <option value="safety_officer">Safety Officer</option>
               <option value="analyst">Financial Analyst</option>
             </select>
          </div>
        </div>

        <div className={styles.formOptions} style={{ marginTop: '1.5rem' }}>
          <label className={styles.checkbox}>
            <input type="checkbox" name="terms" required />
            I agree to the Terms of Service
          </label>
        </div>

        <button className={styles.submitBtn} type="submit">Sign up</button>
      </form>

      <div className={styles.signupAction}>
        <div className={styles.signupHint}>
          Already have an account? <Link href="/login" className={styles.signupLink}>Sign in</Link>
        </div>
      </div>
    </>
  )
}
