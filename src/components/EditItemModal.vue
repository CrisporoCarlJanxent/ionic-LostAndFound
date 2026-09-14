<template>
  <ion-header>
    <ion-toolbar>
      <ion-title>Edit Item</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="$emit('close')">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="ion-padding">
    <form @submit.prevent="submit">
      <ion-item>
        <ion-label position="floating">Item Name</ion-label>
        <ion-input v-model="form.itemName"></ion-input>
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

      <ion-item>
        <ion-label>Date</ion-label>
        <ion-datetime v-model="form.date" presentation="date"></ion-datetime>
      </ion-item>

      <ion-item>
        <ion-label>Time</ion-label>
        <ion-datetime v-model="form.time" presentation="time"></ion-datetime>
      </ion-item>

      <ion-item>
        <ion-label>Status</ion-label>
        <ion-select v-model="form.status">
          <ion-select-option value="Unclaimed">Unclaimed</ion-select-option>
          <ion-select-option value="Claimed">Claimed</ion-select-option>
        </ion-select>
      </ion-item>

      <ion-button expand="block" type="submit" class="ion-margin-top">
        Save Changes
      </ion-button>

      <ion-text v-if="errorMessage" color="danger">
        <p>{{ errorMessage }}</p>
      </ion-text>
    </form>
  </ion-content>
</template>

<script setup>
import { reactive, ref } from "vue";
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
import { useItems } from "@/composables/useItems";

const props = defineProps({ item: { type: Object, required: true } });
const emit = defineEmits(["close", "updated"]);
const { updateItem } = useItems();
const errorMessage = ref("");

const form = reactive({ ...props.item });

async function submit() {
  errorMessage.value = "";

  try {
    const { id, ...data } = form;
    await updateItem(id, data);
    emit("updated");
    emit("close");
  } catch (error) {
    console.error("Unable to update item in Firebase:", error);
    errorMessage.value =
      "Unable to update this item. Check your Firebase connection and permissions.";
  }
}
</script>
