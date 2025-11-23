/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const admin = require("firebase-admin");
const Busboy = require("busboy");

admin.initializeApp();

exports.uploadProfilePhoto = onRequest(async (req, res) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const busboy = new Busboy({ headers: req.headers });
  let uploadData = null;

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const buffers = [];
    file.on("data", (data) => buffers.push(data));
    file.on("end", () => {
      uploadData = {
        buffer: Buffer.concat(buffers),
        filename,
        mimetype,
      };
    });
  });

  busboy.on("finish", async () => {
    if (!uploadData) return res.status(400).send("No file uploaded");

    try {
      const bucket = admin.storage().bucket();
      const file = bucket.file(`profilePhotos/${uploadData.filename}`);

      await file.save(uploadData.buffer, { contentType: uploadData.mimetype });

      // Create a signed URL valid far in the future
      const [url] = await file.getSignedUrl({ action: "read", expires: "03-01-2500" });

      res.json({ url });
    } catch (err) {
      console.error(err);
      res.status(500).send("Upload failed");
    }
  });

  req.pipe(busboy);
});
