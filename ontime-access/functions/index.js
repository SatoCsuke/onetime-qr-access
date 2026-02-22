const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

initializeApp();
const auth = getAuth();
const firestore = getFirestore('id-database');

exports.signup = onCall(
  { cors: ["http://localhost:3000", "https://causal-plating-383208.web.app", "https://firebasestorage.googleapis.com"] },
  async (request, _response) => {
    const qrCodeId = request.data.qrcodeid;
    const email = request.data.email;
    const password = request.data.password;

    if (!qrCodeId) {
      throw new HttpsError("invalid-argument", "QRコードIDが必要です");
    }

    const doc = await firestore.collection('qrid').doc(qrCodeId).get()
    console.log(`doc: ${doc}`);
    if (!doc.data()) {
      console.log(`doc2: ${doc.data()}`);
      throw new HttpsError("not-found", "無効なQRコードIDです。");
    }

    try {

      await firestore.runTransaction(async (transuction) => {
        const qrCodeRef = firestore.collection('qrid').doc(qrCodeId);
        const qrCodeDoc = await transuction.get(qrCodeRef);
        const qrCodeData = qrCodeDoc.data();

        if (qrCodeData.isUsed) {
          throw new HttpsError("not-found", "使用済みのQRコードIDです。");
        }

        try {
          await auth.createUser({
            email: email,
            password: password,
            emailVerified: false,
            disabled: false,
          })
        } catch (error) {
          console.error(`Code: ${error.code}, Message: ${error.message}`);
          switch (error.code) {
            case "auth/email-already-exists":
              throw new HttpsError("already-exists", error.message);

            case "auth/invalid-email":
              throw new HttpsError("invalid-argument", error.message);

            case "auth/invalid-password":
              throw new HttpsError("invalid-argument", error.message);

            default:
              throw new HttpsError("internal", `認証処理中にエラーが発生しました: ${error.message}`);
          }
        }

        await transuction.update(qrCodeRef, { isUsed: true });

      });
    } catch (error) {
      console.error(error)
      throw new HttpsError("internal", error.message);
    }

    return { isSuccess: true };
  });
