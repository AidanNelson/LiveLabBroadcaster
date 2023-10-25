export const updateFeature = async (feature) => {
  try {
    console.log("Updating feature", feature);

    const res = await fetch(`/api/venue/${"vvv"}/updateFeature`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updatedFeatureInfo: feature }),
    });
    console.log("Update feature response?", res);
  } catch (err) {
    console.error(err);
  }
};
