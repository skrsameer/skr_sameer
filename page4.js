// Firebase config + initialization
const firebaseConfig = {
  apiKey: "AIzaSyCZ8xdSzT1kNBFn1OKzjmHFE1Y_HRONJ4Q",
  authDomain: "earn-with-skr-b3eb0.firebaseapp.com",
  databaseURL: "https://earn-with-skr-b3eb0-default-rtdb.firebaseio.com",
  projectId: "earn-with-skr-b3eb0",
  storageBucket: "earn-with-skr-b3eb0.appspot.com",
  messagingSenderId: "632843327266",
  appId: "1:632843327266:web:57c5ad6d78fae0ad0b377b",
  measurementId: "G-M44HFP9M3Y"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

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

  // Password show/hide toggle
  togglePassword.addEventListener("click", () => {
    const input = document.getElementById("loginPassword");
    if (input.type === "password") {
      input.type = "text";
      togglePassword.textContent = "Hide";
    } else {
      input.type = "password";
      togglePassword.textContent = "Show";
    }
  });

  // Login submit
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    loginError.textContent = "";

    if (!username || !password) {
      loginError.textContent = "Please fill in all fields.";
      return;
    }

    // Check localStorage users data
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Password stored base64 encoded (btoa)
    const encodedPass = btoa(password);

    const found = users.find(
      (user) => user.username === username && user.password === encodedPass
    );

    if (found) {
      sessionStorage.setItem("currentUser", JSON.stringify(found));
      window.location.href = "page7.html"; // Redirect after successful login
    } else {
      loginError.textContent = "Invalid username or password.";
    }
  });

  // Open Forgot Password Modal
  forgotPasswordLink.addEventListener("click", () => {
    forgotPasswordModal.style.display = "block";
  });

  // Close modals
  closeForgotModal.addEventListener("click", () => {
    forgotPasswordModal.style.display = "none";
  });
  closeResetModal.addEventListener("click", () => {
    resetPasswordModal.style.display = "none";
  });

  // Close modal if clicked outside modal content
  window.onclick = (event) => {
    if (event.target === forgotPasswordModal) {
      forgotPasswordModal.style.display = "none";
    }
    if (event.target === resetPasswordModal) {
      resetPasswordModal.style.display = "none";
    }
  };

  // Setup Recaptcha verifier globally
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
    "recaptcha-container",
    {
      size: "invisible",
      callback: (response) => {
        // reCAPTCHA solved, allow submit
      },
      "expired-callback": () => {
        // Reset reCAPTCHA?
      },
    }
  );
  window.recaptchaVerifier.render();

  // Forgot Password submit - send OTP
  forgotPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const phone = document.getElementById("resetPhone").value.trim();

    if (!phone.match(/^\d{10}$/)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find((u) => u.phone === phone);

    if (!user) {
      alert("Phone number not found in registered users.");
      return;
    }

    resetUserPhone = phone;

    // Use Firebase to send OTP
    auth
      .signInWithPhoneNumber("+91" + phone, window.recaptchaVerifier)
      .then((confirmationResult) => {
        window.confirmationResult = confirmationResult;
        forgotPasswordModal.style.display = "none";
        resetPasswordModal.style.display = "block";
      })
      .catch((error) => {
        console.error(error);
        alert("Failed to send OTP. Please try again later.");
      });
  });

  // Reset Password submit - verify OTP and update password
  resetPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const otp = document.getElementById("otpInput").value.trim();
    const newPass = document.getElementById("newPassword").value.trim();
    const confirmPass = document.getElementById("confirmNewPassword").value.trim();

    if (!otp || !newPass || !confirmPass) {
      alert("Please fill all fields.");
      return;
    }

    if (newPass !== confirmPass) {
      alert("Passwords do not match.");
      return;
    }

    if (newPass.length < 6) {
      alert("Password should be at least 6 characters.");
      return;
    }

    window.confirmationResult
      .confirm(otp)
      .then(() => {
        // OTP verified successfully
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const idx = users.findIndex((u) => u.phone === resetUserPhone);
        if (idx === -1) {
          alert("User not found.");
          resetPasswordModal.style.display = "none";
          return;
        }

        users[idx].password = btoa(newPass); // encode password
        localStorage.setItem("users", JSON.stringify(users));

        alert("Password updated successfully!");
        resetPasswordModal.style.display = "none";
      })
      .catch(() => {
        alert("Invalid OTP. Please try again.");
      });
  });
});
