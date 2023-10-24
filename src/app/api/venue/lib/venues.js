import { mongoClient } from "../../../../../shared/db";

export const createDefaultVenueDoc = ({ venueId, userId }) => {
  return {
    venueId,
    creator: userId,
    editors: [userId],
    name: venueId,
    description: "",
    urlSlug: venueId,
    features: [],
    cues: [],
    staticFiles: [],
  };
};

export const getVenue = async ({ venueId }) => {
  await mongoClient.connect();
  const database = mongoClient.db("virtual-venue-db");
  const collection = database.collection("venues");

  const venue = await collection.findOne({ venueId });
  console.log("venue:", venue);
  return venue ? venue : null;
};

export const createVenue = async ({ venueId, userId }) => {
  const existingVenue = await getVenue({ venueId });

  if (!existingVenue) {
    await mongoClient.connect();
    const database = mongoClient.db("virtual-venue-db");
    const collection = database.collection("venues");
    const result = await collection.insertOne(
      createDefaultVenueDoc(venueId, userId),
    );
    console.log("result:", result);
  } else {
    throw new Error(`Venue with ID ${venueId} already exists`);
  }
};

// export const updateVenue = async ({venueId, userId, deltas}) => {
//     const existingVenue = await getVenue({ venueId });

//     if (!existingVenue.creator.includes(userId)){
//         throw new Error("User not editor of this venue");
//     } else {
//         existingVenue = {...existingVenue, }
//     }

// }

export const updateVenue = async ({ venueId, userId, updatedVenueInfo }) => {
  const existingVenue = await getVenue({ venueId });

  if (!existingVenue.editors.includes(userId)) {
    throw new Error("User not editor of this venue");
  } else {
    // we can't update the document _id or it will throw an error
    delete updatedVenueInfo["_id"];
    console.log({ updatedVenueInfo });
    await mongoClient.connect();
    const database = mongoClient.db("virtual-venue-db");
    const venuesCollection = database.collection("venues");
    const result = await venuesCollection.replaceOne(
      { _id: existingVenue._id },
      updatedVenueInfo,
    );
    console.log(result);
  }
};


export const updateFeature = async ({ venueId, userId, updatedFeatureInfo }) => {
  const existingVenueInfo = await getVenue({ venueId });

  if (!existingVenueInfo.editors.includes(userId)) {
    throw new Error("User not editor of this venue");
  } else {
    let oldFeatureIndex = existingVenueInfo.features.findIndex(x => x.id === updatedFeatureInfo.id);
    if (oldFeatureIndex){
      existingVenueInfo.features[oldFeatureIndex] = updatedFeatureInfo;
      console.log(existingVenueInfo);
      updateVenue({ venueId, userId, updatedVenueInfo: existingVenueInfo})
    } else {
      //
    }
    // we can't update the document _id or it will throw an error
    // await mongoClient.connect();
    // const database = mongoClient.db("virtual-venue-db");
    // const venuesCollection = database.collection("venues");
    // const result = await venuesCollection.replaceOne(
    //   { _id: existingVenue._id },
    //   updatedVenueInfo,
    // );
    // console.log(result);
  }
};
