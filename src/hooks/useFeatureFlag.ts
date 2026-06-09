import { featureFlags, type FeatureFlagKey } from "@/config/feature-flags";

export function useFeatureFlag(flag: FeatureFlagKey): boolean {
  return featureFlags[flag];
}
