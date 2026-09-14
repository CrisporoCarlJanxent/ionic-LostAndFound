<template>
  <ion-header class="auth-header ion-no-border">
    <ion-toolbar>
      <ion-title>{{
        isRegistering ? "Create account" : "Welcome back"
      }}</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="emit('close')">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="auth-content ion-padding">
    <form @submit.prevent="submit">
      <div class="auth-intro">
        <div class="auth-mark">LF</div>
        <p>
          {{
            isRegistering
              ? "Create an account to report and manage your items."
              : "Sign in to report and manage your items."
          }}
        </p>
      </div>

      <ion-item>
        <ion-label position="floating">Email</ion-label>
        <ion-input v-model="email" type="email" autocomplete="email" required />
      </ion-item>
      <ion-item>
        <ion-label position="floating">Password</ion-label>
        <ion-input
          v-model="password"
          type="password"
          :autocomplete="isRegistering ? 'new-password' : 'current-password'"
          required
        />
      </ion-item>

      <ion-button
        expand="block"
        type="submit"
        class="auth-submit"
        :disabled="loading"
      >
        {{
          loading
            ? "Please wait..."
            : isRegistering
              ? "Create account"
              : "Sign in"
        }}
      </ion-button>

      <ion-text v-if="errorMessage" color="danger">
        <p class="auth-error">{{ errorMessage }}</p>
      </ion-text>

      <ion-button
        fill="clear"
        type="button"
        class="mode-button"
        @click="toggleMode"
      >
        {{
          isRegistering
            ? "Already have an account? Sign in"
            : "New here? Create an account"
        }}
      </ion-button>
    </form>
  </ion-content>
</template>

<script setup>
import { ref } from "vue";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
} from "@ionic/vue";
import { auth } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

const emit = defineEmits(["close", "authenticated"]);
const email = ref("");
const password = ref("");
const isRegistering = ref(false);
const loading = ref(false);
const errorMessage = ref("");

function toggleMode() {
  isRegistering.value = !isRegistering.value;
  errorMessage.value = "";
}

async function submit() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const method = isRegistering.value
      ? createUserWithEmailAndPassword
      : signInWithEmailAndPassword;
    await method(auth, email.value.trim(), password.value);
    emit("authenticated");
    emit("close");
  } catch (error) {
    console.error("Authentication failed:", error);
    const errorCode = error?.code;
    errorMessage.value =
      errorCode === "auth/operation-not-allowed"
        ? "Email/password sign-in is disabled. Enable it in Firebase Authentication."
        : errorCode === "auth/invalid-credential"
          ? "That email or password is incorrect."
          : errorCode === "auth/email-already-in-use"
            ? "That email is already registered. Sign in instead."
            : errorCode === "auth/weak-password"
              ? "Use a password with at least 6 characters."
              : "Unable to authenticate. Check your email and password.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-header {
  background: var(--app-paper);
}
.auth-header ion-toolbar {
  --background: var(--app-paper);
  --border-width: 0;
  --padding-start: 20px;
  --padding-end: 12px;
  --min-height: 68px;
}
.auth-header ion-title {
  padding: 0;
  color: var(--app-ink);
  font-size: 21px;
  font-weight: 800;
  text-align: left;
}
.auth-header ion-button {
  --color: var(--app-ink);
  font-size: 13px;
  font-weight: 700;
  text-transform: none;
}
.auth-content {
  --background: var(--app-paper);
}
form {
  max-width: 520px;
  margin: 0 auto;
}
.auth-intro {
  margin-bottom: 22px;
  text-align: center;
}
.auth-mark {
  display: grid;
  width: 58px;
  height: 58px;
  margin: 0 auto 12px;
  place-items: center;
  border-radius: 18px;
  color: #fff;
  background: var(--app-ink);
  font-weight: 800;
  letter-spacing: 0.08em;
}
.auth-intro p {
  margin: 0;
  color: var(--app-muted);
  font-size: 13px;
  line-height: 1.45;
}
form > ion-item {
  --background: #f7f4ef;
  --border-color: transparent;
  --highlight-color-focused: var(--app-coral);
  --min-height: 56px;
  margin-bottom: 10px;
  border: 1px solid var(--app-line);
  border-radius: 14px;
  overflow: hidden;
}
form ion-label {
  color: var(--app-muted);
  font-size: 12px;
  font-weight: 600;
}
form ion-input {
  --color: var(--app-ink);
  --placeholder-color: #687571;
  --placeholder-opacity: 1;
}
.auth-submit {
  --border-radius: 14px;
  height: 52px;
  margin-top: 14px;
  font-weight: 800;
  text-transform: none;
}
.auth-error {
  margin: 12px 2px 0;
  color: #a83232;
  font-size: 12px;
  line-height: 1.4;
}
.mode-button {
  width: 100%;
  margin-top: 8px;
  --color: var(--app-coral);
  font-size: 12px;
  text-transform: none;
}
</style>
