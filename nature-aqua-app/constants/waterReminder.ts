// =====================================================
// NURTUREAQUA - WATER CARE REMINDER
// =====================================================

// Notifications are temporarily disabled while
// testing with Expo Go on Android.
//
// Expo Go Android does not support the required
// notification functionality reliably in SDK 53+.
//
// We will enable notifications again in the
// EAS development build.

export type WaterReminderRisk =
  | "Low Risk"
  | "Moderate Risk"
  | "High Risk";

export async function scheduleWaterChangeReminder(
  riskLevel: WaterReminderRisk
) {
  console.log(
    "Water reminder:",
    riskLevel
  );

  // Temporarily disabled for Expo Go testing.
  // The reminder logic is preserved below.

  let message = "";

  if (riskLevel === "High Risk") {
    message =
      "High water quality risk. Perform a 30–50% partial water change and re-check the water parameters within 6–12 hours.";
  } else if (riskLevel === "Moderate Risk") {
    message =
      "Moderate water quality risk. Perform a 20–30% partial water change and re-check the water parameters within 24–48 hours.";
  } else {
    message =
      "Low water quality risk. Perform your routine 20–25% partial water change and re-check the water parameters within 7 days.";
  }

  console.log(
    "Reminder message:",
    message
  );

  return {
    scheduled: false,
    reason:
      "Notifications temporarily disabled for Expo Go Android",
  };
}