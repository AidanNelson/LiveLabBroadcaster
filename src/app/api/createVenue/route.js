const Datastore = require('nedb');


// function findOne(db, opt) {
//     return new Promise(function(resolve, reject) {
//       db.findOne(opt, function(err, doc) {
//         if (err) {
//           reject(err)
//         } else {
//           resolve(doc)
//         }
//       })
//     })
//   }

const addDoc = (db, doc) => {
    return new Promise((resolve,reject) => {
        db.insert(doc, function (err, doc) {
            if (err) {
                          reject(err)
                        } else {
                          resolve(doc)
                        }
        });
    })
}

export async function POST(request) {
    console.log("received request:",request);
    const venueDb = new Datastore({ filename: 'venues.db', autoload: true });
    const doc = await addDoc(venueDb,{});
    return Response.json(doc);
    //     if (err){
    //         console.error(err);
    //         return {};
    //     } 
    //     if (doc){
    //         return Response.json(doc);
    //     }
    // })

    // const existingVenue = findOne(venueDb, {name: })
    
    // const res = await fetch('https://data.mongodb-api.com/...', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'API-Key': process.env.DATA_API_KEY,
    //   },
    //   body: JSON.stringify({ time: new Date().toISOString() }),
    // })
   
    // const data = await res.json()
   
    // return Response.json({})
  }
