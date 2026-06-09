import type { TimeMachineResult } from "./domain";

export async function runTimeMachine(): Promise<TimeMachineResult> {
  return {
    scenarios: [],
    generatedAt: new Date().toISOString()
  };
}
