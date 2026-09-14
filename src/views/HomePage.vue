<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Lost & Found</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="showAddModal = true">
            <ion-icon :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-text v-if="errorMessage" color="danger">
        <p class="ion-padding">{{ errorMessage }}</p>
      </ion-text>

      <ItemList
        :items="items"
        @select="openEdit"
        @claim="handleClaim"
        @delete="handleDelete"
      />
    </ion-content>

    <ion-modal :is-open="showAddModal" @didDismiss="showAddModal = false">
      <AddItemForm @close="showAddModal = false" />
    </ion-modal>

    <ion-modal :is-open="showEditModal" @didDismiss="showEditModal = false">
      <EditItemModal
        v-if="selectedItem"
        :item="selectedItem"
        @close="showEditModal = false"
      />
    </ion-modal>
  </ion-page>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonModal,
  IonText,
} from "@ionic/vue";
import { addOutline } from "ionicons/icons";
import { useItems } from "@/composables/useItems";

import ItemList from "@/components/ItemList.vue";
import AddItemForm from "@/components/AddItemForm.vue";
import EditItemModal from "@/components/EditItemModal.vue";

const { items, subscribeToItems, markAsClaimed, deleteItem } = useItems();

const showAddModal = ref(false);
const showEditModal = ref(false);
const selectedItem = ref(null);
const errorMessage = ref("");

let unsubscribe;
onMounted(() => {
  unsubscribe = subscribeToItems((error) => {
    console.error("Unable to read items from Firebase:", error);
    errorMessage.value =
      "Unable to load items. Check your Firebase connection and permissions.";
  });
});
onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

function openEdit(item) {
  selectedItem.value = item;
  showEditModal.value = true;
}

async function handleClaim(id) {
  await runCrudAction(() => markAsClaimed(id), "claim this item");
}

async function handleDelete(id) {
  await runCrudAction(() => deleteItem(id), "delete this item");
}

async function runCrudAction(action, description) {
  errorMessage.value = "";

  try {
    await action();
  } catch (error) {
    console.error(`Unable to ${description} in Firebase:`, error);
    errorMessage.value = `Unable to ${description}. Check your Firebase connection and permissions.`;
  }
}
</script>
