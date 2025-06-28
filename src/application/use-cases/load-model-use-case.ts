import { ModelLoadingEvent } from "@/application/events/model-loading-event";
import { EventBus, eventBus } from "@/infrastructure/event-bus/event-bus";
import {
  PredictionAdapter,
  predictionAdapter,
} from "@/infrastructure/adapters/prediction.adapter";

export class LoadModelUseCase {
  constructor(
    private predictionAdapter: PredictionAdapter,
    private eventBus: EventBus
  ) {}

  async execute(): Promise<void> {
    const loadingEvent = new ModelLoadingEvent({ status: "loading" });
    this.eventBus.publish(loadingEvent);

    try {
      await this.predictionAdapter.initialize();

      const readyEvent = new ModelLoadingEvent({ status: "ready" });
      this.eventBus.publish(readyEvent);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorEvent = new ModelLoadingEvent({
        status: "error",
        message: errorMessage,
      });
      this.eventBus.publish(errorEvent);
      throw error;
    }
  }
}
export const loadModelUseCase = new LoadModelUseCase(
  predictionAdapter,
  eventBus
);
