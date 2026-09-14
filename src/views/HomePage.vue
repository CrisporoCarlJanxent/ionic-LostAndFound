<template>
  <ion-page>
    <ion-header class="app-header ion-no-border">
      <ion-toolbar>
        <div class="brand" slot="start">
          <span class="brand-mark">LF</span>
          <div>
            <p class="eyebrow">Community board</p>
            <ion-title>Lost &amp; Found</ion-title>
          </div>
        </div>
        <ion-buttons slot="end">
          <ion-button class="add-button" aria-label="Report an item" @click="showAddModal = true">
            <ion-icon :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="home-content">
      <section class="welcome-panel">
        <div>
          <p class="eyebrow">Keep an eye out</p>
          <h1>Help good things<br /><em>find their way home.</em></h1>
          <p class="welcome-copy">Report a lost or found item and let your community do the searching.</p>
        </div>
        <div class="item-count" aria-label="Number of reports">
          <strong>{{ items.length }}</strong>
          <span>reports</span>
        </div>
      </section>

      <ion-text v-if="errorMessage" color="danger">
        <p class="error-banner">{{ errorMessage }}</p>
      </ion-text>

      <div class="section-heading">
        <div>
          <p class="eyebrow">Latest activity</p>
          <h2>Community reports</h2>
        </div>
        <span class="swipe-hint">Swipe for actions</span>
      </div>

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

<style scoped>
.app-header { background: var(--ion-background-color); }
.app-header ion-toolbar {
  --background: var(--ion-background-color);
  --border-width: 0;
  --padding-start: 20px;
  --padding-end: 14px;
  --min-height: 76px;
}
.brand { display: flex; align-items: center; gap: 11px; }
.brand-mark {
  display: grid; width: 42px; height: 42px; place-items: center;
  border-radius: 13px; color: #fff; background: var(--app-ink);
  font-size: 13px; font-weight: 800; letter-spacing: .08em;
}
.eyebrow {
  margin: 0 0 4px; color: var(--app-coral); font-size: 10px;
  font-weight: 800; letter-spacing: .14em; line-height: 1; text-transform: uppercase;
}
.brand ion-title { padding: 0; color: var(--app-ink); font-size: 18px; font-weight: 800; text-align: left; }
.add-button {
  --background: var(--app-coral); --border-radius: 14px; --color: #fff;
  width: 46px; height: 46px; margin: 0; box-shadow: 0 8px 16px rgba(226, 93, 79, .22);
}
.add-button ion-icon { font-size: 24px; }
.home-content { --padding-bottom: 32px; }
.welcome-panel, .section-heading, .home-content > :deep(ion-list) {
  width: min(calc(100% - 32px), 760px); margin-right: auto; margin-left: auto;
}
.welcome-panel {
  display: flex; align-items: end; justify-content: space-between; min-height: 184px;
  margin-top: 10px; padding: 24px 22px; border-radius: 24px; color: #fff;
  background: var(--app-ink); overflow: hidden; position: relative;
}
.welcome-panel::after {
  position: absolute; right: -38px; top: -42px; width: 150px; height: 150px;
  border: 22px solid var(--app-yellow); border-radius: 50%; content: ""; opacity: .9;
}
.welcome-panel h1 { max-width: 250px; margin: 8px 0 10px; font-size: clamp(25px, 7vw, 38px); font-weight: 800; line-height: 1.03; }
.welcome-panel h1 em { color: var(--app-yellow); font-style: normal; }
.welcome-panel .eyebrow { color: #b7dfd0; }
.welcome-copy { max-width: 280px; margin: 0; color: #b8c7c3; font-size: 13px; line-height: 1.45; }
.item-count { z-index: 1; display: flex; flex-direction: column; align-items: flex-end; margin-bottom: 1px; }
.item-count strong { color: var(--app-yellow); font-size: 34px; line-height: 1; }
.item-count span { color: #d9e1de; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.error-banner {
  width: min(calc(100% - 32px), 760px); margin: 14px auto 0; padding: 12px 14px;
  border: 1px solid #efc2c2; border-radius: 12px; background: #fff1f1; font-size: 13px;
}
.section-heading { display: flex; align-items: end; justify-content: space-between; margin-top: 28px; margin-bottom: 10px; }
.section-heading h2 { margin: 0; color: var(--app-ink); font-size: 21px; font-weight: 800; }
.swipe-hint { color: var(--app-muted); font-size: 11px; }
@media (min-width: 600px) { .welcome-panel { min-height: 220px; padding: 32px; } }
</style>
