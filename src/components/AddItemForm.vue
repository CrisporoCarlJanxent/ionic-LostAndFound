<template>
  <ion-header class="form-header ion-no-border">
    <ion-toolbar>
      <ion-title>Report an Item</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="$emit('close')">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="form-content ion-padding">
    <form @submit.prevent="submit">
      <p class="form-intro">
        Tell us a few details so the right person can find it.
      </p>
      <ion-item>
        <ion-label position="floating">Item Name</ion-label>
        <ion-input v-model="form.itemName" required></ion-input>
      </ion-item>

      <ion-item>
        <ion-label position="floating">Description</ion-label>
        <ion-textarea v-model="form.description"></ion-textarea>
      </ion-item>

      <ion-item>
        <ion-label>Type</ion-label>
        <ion-select v-model="form.type">
          <ion-select-option value="Lost">Lost</ion-select-option>
          <ion-select-option value="Found">Found</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-item>
        <ion-label position="floating">Location</ion-label>
        <ion-input v-model="form.location"></ion-input>
      </ion-item>

      <div class="image-field">
        <input
          ref="imageInput"
          class="image-input"
          type="file"
          accept="image/*"
          capture="environment"
          @change="selectImage"
        />
        <ion-button
          type="button"
          fill="outline"
          class="image-button"
          @click="openImagePicker"
        >
          Add a photo
        </ion-button>
        <img
          v-if="imagePreview"
          class="image-preview"
          :src="imagePreview"
          alt="Selected item preview"
        />
        <p class="image-help">A clear photo helps people recognize the item.</p>
      </div>

      <div class="date-time-grid">
        <ion-item>
          <ion-label>Date</ion-label>
          <ion-datetime v-model="form.date" presentation="date"></ion-datetime>
        </ion-item>

        <ion-item>
          <ion-label>Time</ion-label>
          <ion-datetime v-model="form.time" presentation="time"></ion-datetime>
        </ion-item>
      </div>

      <ion-button expand="block" type="submit" class="ion-margin-top">
        Submit
      </ion-button>

      <ion-text v-if="errorMessage" color="danger">
        <p>{{ errorMessage }}</p>
      </ion-text>
    </form>
  </ion-content>
</template>

<script setup>
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
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonText,
} from "@ionic/vue";
import { ref, reactive } from "vue";
import { useItems } from "@/composables/useItems";

const emit = defineEmits(["close", "added"]);
const { addItem } = useItems();
const errorMessage = ref("");
const imageInput = ref(null);
const imageFile = ref(null);
const imagePreview = ref("");
const imageDataUrl = ref("");

const form = reactive({
  itemName: "",
  description: "",
  type: "Lost",
  location: "",
  date: "",
  time: "",
  status: "Unclaimed",
});

async function submit() {
  errorMessage.value = "";

  try {
    if (imageFile.value) {
      imageDataUrl.value = await compressImage(imageFile.value);
    }

    await addItem({ ...form }, imageDataUrl.value);
    emit("added");
    emit("close");
  } catch (error) {
    console.error("Unable to save item to Firebase:", error);
    errorMessage.value =
      error.message === "compressed image is too large"
        ? "This image is still too large after compression. Choose a smaller photo."
        : error.message === "auth-required"
          ? "Please sign in before submitting a report."
          : "Unable to save this item. Check your Firebase connection and permissions.";
  }
}

function openImagePicker() {
  imageInput.value?.click();
}

function selectImage(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
    errorMessage.value = "Choose an image smaller than 5 MB.";
    event.target.value = "";
    return;
  }

  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
  imageDataUrl.value = "";
  errorMessage.value = "";
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      image.onload = () => {
        const scale = Math.min(1, 1024 / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas
          .getContext("2d")
          .drawImage(image, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.72);
        if (dataUrl.length > 1024 * 1024) {
          reject(new Error("compressed image is too large"));
          return;
        }

        resolve(dataUrl);
      };
      image.onerror = reject;
      image.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
</script>

<style scoped>
.form-header {
  background: var(--app-paper);
}
.form-header ion-toolbar {
  --background: var(--app-paper);
  --border-width: 0;
  --padding-start: 20px;
  --padding-end: 12px;
  --min-height: 68px;
}
.form-header ion-title {
  padding: 0;
  color: var(--app-ink);
  font-size: 21px;
  font-weight: 800;
  text-align: left;
}
.form-header ion-button {
  --color: var(--app-ink);
  font-size: 13px;
  font-weight: 700;
  text-transform: none;
}
.form-content {
  --background: var(--app-paper);
}
form {
  max-width: 520px;
  margin: 0 auto;
}
.form-intro {
  margin: 0 0 18px;
  color: var(--app-muted);
  font-size: 13px;
  line-height: 1.45;
}
form > ion-item,
.date-time-grid ion-item {
  --background: #f7f4ef;
  --border-color: transparent;
  --border-radius: 14px;
  --highlight-color-focused: var(--app-coral);
  --min-height: 56px;
  margin-bottom: 10px;
  border: 1px solid var(--app-line);
  border-radius: 14px;
  overflow: hidden;
}
form > ion-item:focus-within,
.date-time-grid ion-item:focus-within {
  border-color: var(--app-coral);
}
form ion-label {
  color: var(--app-muted);
  font-size: 12px;
  font-weight: 600;
}
form ion-input,
form ion-textarea,
form ion-select {
  --color: var(--app-ink);
  --placeholder-color: #687571;
  --placeholder-opacity: 1;
}
.date-time-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}
.image-field {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 12px;
  align-items: center;
  margin: 4px 0 8px;
  padding: 14px;
  border: 1px dashed var(--app-line);
  border-radius: 14px;
  background: #f7f4ef;
}
.image-input {
  display: none;
}
.image-button {
  --border-color: var(--app-coral);
  --color: var(--app-coral);
  --border-radius: 12px;
  margin: 0;
  font-size: 13px;
  font-weight: 800;
  text-transform: none;
}
.image-preview {
  width: 58px;
  height: 58px;
  border-radius: 12px;
  object-fit: cover;
}
.image-help {
  margin: 0;
  color: var(--app-muted);
  font-size: 11px;
  line-height: 1.35;
}
.date-time-grid ion-datetime {
  width: 100%;
  --background: transparent;
  --background-rgb: 247, 244, 239;
  font-size: 13px;
}
form > ion-button {
  --border-radius: 14px;
  height: 52px;
  margin-top: 12px;
  font-size: 15px;
  font-weight: 800;
  text-transform: none;
  box-shadow: 0 8px 16px rgba(226, 93, 79, 0.2);
}
form > ion-text p {
  margin: 12px 2px 0;
  color: #a83232;
  font-size: 12px;
  line-height: 1.4;
}
@media (min-width: 420px) {
  .date-time-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
}
</style>
