import styles from './AuthLayout.module.scss'

const AuthLayout = ({ children }) => (
  <div className={styles.authPage}>
    <div className={styles.authShell}>
      <aside className={styles.brandPanel}>
        <a href="/" className={styles.brand} aria-label="Taskflow Pro home"><span className={styles.brandMark}>t<span>.</span></span><span>taskflow<small>PRO</small></span></a>
        <div className={styles.brandCopy}>
          <span className={styles.kicker}>A smarter kind of momentum</span>
          <h1>Make space<br />for your <em>next.</em></h1>
          <p>Less mental clutter. More meaningful progress. Your day, with a little more intention.</p>
        </div>
        <div className={styles.artwork} aria-hidden="true">
          <span className={styles.discOne} /><span className={styles.discTwo} /><span className={styles.discThree} />
          <span className={styles.artLine} /><span className={styles.artNumber}>01—07</span>
        </div>
        <div className={styles.panelFooter}><span>PLAN WITH INTENTION</span><span>TASKFLOW / 2026</span></div>
      </aside>
      <main className={styles.authContainer}>
        <a href="/" className={styles.mobileBrand}><span className={styles.mobileMark}>t<span>.</span></span> taskflow<small>PRO</small></a>
        {children}
        <p className={styles.formFooter}>A clearer day starts here <span aria-hidden="true" /></p>
      </main>
    </div>
  </div>
)

export default AuthLayout
