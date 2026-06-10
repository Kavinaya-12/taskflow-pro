import React from 'react'
import styles from './BackgroundEffects.module.scss'

const particles = Array.from({ length: 40 })

const BackgroundEffects = () => {
  return (
    <div className={styles.backgroundWrapper}>
      <div className={styles.orbOne}></div>
      <div className={styles.orbTwo}></div>

      <div className={styles.mesh}></div>

      <div className={styles.particles}>
        {particles.map((_, index) => (
          <div key={index} className={styles.particle} />
        ))}
      </div>
    </div>
  )
}

export default BackgroundEffects
