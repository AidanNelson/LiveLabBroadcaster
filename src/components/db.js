export const updateFeature = async (stageId, feature) => {
  try {
    console.log("Updating feature", feature);

    const res = await fetch(`/api/stage/${stageId}/updateFeature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedFeatureInfo: feature }),
    });
    console.log("Update feature response?", res);
  } catch (err) {
    console.error(err);
  }
};
