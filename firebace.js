// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZ8xdSzT1kNBFn1OKzjmHFE1Y_HRONJ4Q",
  authDomain: "earn-with-skr-b3eb0.firebaseapp.com",
  databaseURL: "https://earn-with-skr-b3eb0-default-rtdb.firebaseio.com",
  projectId: "earn-with-skr-b3eb0",
  storageBucket: "earn-with-skr-b3eb0.firebasestorage.app",
  messagingSenderId: "632843327266",
  appId: "1:632843327266:web:57c5ad6d78fae0ad0b377b",
  measurementId: "G-M44HFP9M3Y"
};

let recaptchaVerifier;
let confirmationResult;

// OTP भेजने का फंक्शन
function sendOtp() {
  const phoneNumber = "+91" + document.getElementById('phone').value;
  
  // reCAPTCHA सेटअप (अदृश्य)
  recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible',
    callback: (response) => {
      // OTP भेजें जब reCAPTCHA सत्यापित हो जाए
      sendOtpToPhone(phoneNumber);
    }
  });

  // reCAPTCHA वेरिफाई करें
  recaptchaVerifier.verify();
}

// OTP भेजें
function sendOtpToPhone(phoneNumber) {
  auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier)
    .then((result) => {
      confirmationResult = result;
      alert("OTP भेजा गया! मोबाइल नंबर पर चेक करें।");
    })
    .catch((error) => {
      console.error("OTP Error:", error);
      alert("OTP भेजने में त्रुटि: " + error.message);
    });
}
function verifyOtp() {
  const otp = document.getElementById('otp').value;
  
  confirmationResult.confirm(otp)
    .then((userCredential) => {
      alert("OTP सत्यापित हो गया! रजिस्ट्रेशन पूरा हुआ।");
      // यहाँ आप user को डेटाबेस में सेव कर सकते हैं
    })
    .catch((error) => {
      alert("गलत OTP! दोबारा प्रयास करें।");
    });
}