let confirmationResult;

// OTP भेजें
function sendOTP() {
  const phone = document.getElementById('phone').value;
  const appVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');

  firebase.auth().signInWithPhoneNumber(phone, appVerifier)
    .then((result) => {
      confirmationResult = result;
      document.getElementById('otp-div').style.display = 'block';
      alert("OTP भेजा गया!");
    })
    .catch((error) => {
      alert("त्रुटि: " + error.message);
    });
}

// OTP वेरिफाई करें
function verifyOTP() {
  const otp = document.getElementById('otp-code').value;
  confirmationResult.confirm(otp)
    .then((userCredential) => {
      alert("सफलतापूर्वक वेरिफाई हुआ!");
      console.log("User:", userCredential.user);
    })
    .catch((error) => {
      alert("गलत OTP! फिर से प्रयास करें");
    });
}