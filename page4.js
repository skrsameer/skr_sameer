// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "XXXXXXX",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const togglePassword = document.getElementById("togglePassword");
const forgotPassword = document.getElementById("forgotPassword");
const otpLoginBtn = document.getElementById("otpLoginBtn");
const otpModal = document.getElementById("otpModal");
const closeOtpModal = document.getElementById("closeOtpModal");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");

togglePassword.addEventListener("click", () => {
  const pwdInput = document.getElementById("loginPassword");
  pwdInput.type = pwdInput.type === "password" ? "text" : "password";
  togglePassword.classList.toggle("fa-eye-slash");
});

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const phone = "+91" + document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value;

  const storedUsers = JSON.parse(localStorage.getItem("users")) || [];
  const matchedUser = storedUsers.find(u => u.phone === phone && u.password === btoa(password));

  if (matchedUser) {
    sessionStorage.setItem("currentUser", JSON.stringify(matchedUser));
    window.location.href = "page7.html";
  } else {
    loginError.textContent = "Invalid phone or password.";
  }
});

otpLoginBtn.addEventListener("click", () => {
  const phone = "+91" + document.getElementById("loginPhone").value.trim();
  if (!/^[6-9]\d{9}$/.test(phone.substring(3))) {
    alert("Please enter valid Indian phone number");
    return;
  }

  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier("recaptcha-container", {
    size: "invisible",
  });

  auth.signInWithPhoneNumber(phone, window.recaptchaVerifier)
    .then(confirmResult => {
      window.confirmResult = confirmResult;
      otpModal.style.display = "block";
    })
    .catch(error => {
      alert("OTP sending failed: " + error.message);
    });
});

verifyOtpBtn.addEventListener("click", () => {
  const code = document.getElementById("otpCode").value;
  window.confirmResult.confirm(code)
    .then(result => {
      const user = result.user;
      sessionStorage.setItem("currentUser", JSON.stringify({
        phone: user.phoneNumber,
        isLoggedIn: true
      }));
      window.location.href = "page7.html";
    })
    .catch(error => {
      alert("Incorrect OTP");
    });
});

closeOtpModal.addEventListener("click", () => {
  otpModal.style.display = "none";
});