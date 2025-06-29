import { useEffect } from "preact/hooks";
import { WorkoutPage } from "./workout/workout-page";
import { loadModelUseCase } from "@/application/use-cases/load-model-use-case";
import styles from "./app.module.css";

export function App() {
  useEffect(() => {
    loadModelUseCase.execute().catch(() => {
      // Error is handled by the use case and published as event
    });
  }, []);

  return (
    <div className={styles.app}>
      <main className={styles.main}>
        <WorkoutPage />
      </main>
    </div>
  );
}
