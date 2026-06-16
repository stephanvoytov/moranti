import styles from "./hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.imageWrap}>
        <div className={styles.image} />
      </div>
    </section>
  );
}
