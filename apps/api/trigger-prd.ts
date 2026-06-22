import { velocityService } from "@repo/services/velocity";

async function main() {
  const featureId = "6adeabd3-443c-476d-b609-67befe167de2";
  const answers = ["just create a homepage", "render the home page", "no"];
  
  console.log("Triggering Gemini PRD generation for feature:", featureId);
  try {
    const updatedFeature = await velocityService.submitIntakeAnswers(featureId, answers);
    console.log("PRD GENERATION SUCCESS! 🎉");
    console.log("GENERATED PRD CONTENT:\n");
    console.log(updatedFeature.prdContent);
  } catch (err) {
    console.error("Failed to generate PRD:", err);
  }
}

main();
