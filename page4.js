// app.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZ8xdSzT1kNBFn1OKzjmHFE1Y_HRONJ4Q",
  authDomain: "earn-with-skr-b3eb0.firebaseapp.com",
  databaseURL: "https://earn-with-skr-b3eb0-default-rtdb.firebaseio.com",
  projectId: "earn-with-skr-b3eb0",
  storageBucket: "earn-with-skr-b3eb0.appspot.com",
  messagingSenderId: "632843327266",
  appId: "1:632843327266:web:57c5ad6d78fae0ad0b377b",
  measurementId: "G-M44HFP9M3Y",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const loginError = document.getElementById("loginError");
  const togglePassword = document.getElementById("togglePassword");
  const forgotPasswordLink = document.getElementById("forgotPassword");

  const forgotPasswordModal = document.getElementById("forgotPasswordModal");
  const resetPasswordModal = document.getElementById("resetPasswordModal");
  const closeForgotModal = document.getElementById("closeForgotModal");
  const closeResetModal = document.getElementById("closeResetModal");

  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const resetPasswordForm = document.getElementById("resetPasswordForm");

  let resetUserPhone = null;
  let confirmationResult = null;

  // Toggle password visibility
  togglePassword.addEventListener("click", () => {
    const pwdInput = document.getElementById("loginPassword");
    if (pwdInput.type === "password") {
      pwdInput.type = "text";
      togglePassword.textContent = "Hide";
    } else {
      pwdInput.type = "password";
      togglePassword.textContent = "Show";
    }
  });

  // Login form submit
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!username || !password) {
      loginError.textContent = "Please fill in all fields.";
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    // Passwords stored base64 encoded
    const foundUser = users.find(
      (u) => u.username === username && u.password === btoa(password)
    );

    if (foundUser) {
      sessionStorage.setItem("currentUser", JSON.stringify(foundUser));
      // Redirect to page7.html (ensure page7.html exists and is reachable)
      window.location.href = "page7.html";
    } else {
      loginError.textContent = "Invalid username or password.";
    }
  });

  // Show forgot password modal
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    forgotPasswordModal.setAttribute("aria-hidden", "false");
  });

  // Close modals buttons
  closeForgotModal.addEventListener("click", () => {
    forgotPasswordModal.setAttribute("aria-hidden", "true");
    forgotPasswordForm.reset();
    clearRecaptcha();
  });
  closeResetModal.addEventListener("click", () => {
    resetPasswordModal.setAttribute("aria-hidden", "true");
    resetPasswordForm.reset();
  });

  // Setup invisible Recaptcha on the forgot password form submit button container
  const recaptchaContainer = document.getElementById("recaptcha-container");
  let recaptchaVerifier = null;

  function setupRecaptcha() {
    if (!recaptchaVerifier) {
      recaptchaVerifier = new RecaptchaVerifier(
        recaptchaContainer,
        {
          size: "invisible",
          callback: (response) => {
            // recaptcha solved, allow send OTP to proceed
          },
          "expired-callback": () => {
            // Recaptcha expired - reset it
            recaptchaVerifier.reset();
          },
        },
        auth
      );
      recaptchaVerifier.render().then((widgetId) => {
        // widgetId can be used if needed
      });
    }
  }

  function clearRecaptcha() {
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
  }

  // Forgot password form submit - send OTP
  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const phone = document.getElementById("resetPhone").value.trim();
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.phone === phone);

    if (!user) {
      alert("Phone number not found in our records.");
      return;
    }

    resetUserPhone = phone;

    try {
      setupRecaptcha();

      confirmationResult = await signInWithPhoneNumber(
        auth,
        "+91" + phone,
        recaptchaVerifier
      );

      alert("OTP sent to your phone.");

      forgotPasswordModal.setAttribute("aria-hidden", "true");
      resetPasswordModal.setAttribute("aria-hidden", "false");

      // Clear OTP and password fields
      resetPasswordForm.reset();
    } catch (err) {
      console.error(err);
      alert("Error sending OTP. Please try again.");
      clearRecaptcha();
    }
  });

  // Reset password form submit - confirm OTP and update password
  resetPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const otp = document.getElementById("otpInput").value.trim();
    const newPass = document.getElementById("newPassword").value.trim();
    const confirmPass = document.getElementById("confirmNewPassword").value.trim();

    if (newPass.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (newPass !== confirmPass) {
      alert("Passwords do not match.");
      return;
    }

    if (!otp || otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      await confirmationResult.confirm(otp);

      // OTP verified, update password in localStorage users
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const idx = users.findIndex((u) => u.phone === resetUserPhone);
      if (idx === -1) {
        alert("User not found - unexpected error.");
        return;
      }
      users[idx].password = btoa(newPass);
      localStorage.setItem("users", JSON.stringify(users));

      alert("Password updated successfully! You can now login.");

      resetPasswordModal.setAttribute("aria-hidden", "true");
      resetPasswordForm.reset();
      resetUserPhone = null;

      // Clear recaptcha for next use
      clearRecaptcha();
    } catch (error) {
      console.error(error);
      alert("Invalid OTP or error confirming OTP.");
    }
  });

  // Close modals on outside click or ESC key (optional)
  window.addEventListener("click", (e) => {
    if (e.target === forgotPasswordModal) {
      forgotPasswordModal.setAttribute("aria-hidden", "true");
      forgotPasswordForm.reset();
      clearRecaptcha();
    }
    if (e.target === resetPasswordModal) {
      resetPasswordModal.setAttribute("aria-hidden", "true");
      resetPasswordForm.reset();
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (forgotPasswordModal.getAttribute("aria-hidden") === "false") {
        forgotPasswordModal.setAttribute("aria-hidden", "true");
        forgotPasswordForm.reset();
        clearRecaptcha();
      }
      if (resetPasswordModal.getAttribute("aria-hidden") === "false") {
        resetPasswordModal.setAttribute("aria-hidden", "true");
        resetPasswordForm.reset();
      }
    }
  });
});