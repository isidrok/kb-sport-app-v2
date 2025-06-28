import { WorkoutPage } from "./workout/workout-page";
import styles from "./app.module.css";

export function App() {
  return (
    <div className={styles.app}>
      <main className={styles.main}>
        <WorkoutPage />
      </main>
    </div>
  );
}
