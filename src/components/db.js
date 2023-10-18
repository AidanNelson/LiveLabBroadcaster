export const updateFeature = ({ venueId, info }) => {
  try {
    console.log("updating venue", venueId, "feature", info);
    // const res = await fetch(`/api/venue/${params.venueId}/${info.id}/update`, {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ info }),
    // });
    // console.log("updating feature response?", res);
  } catch (err) {
    console.error(err);
  }
};