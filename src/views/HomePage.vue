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
          <ion-button
            class="auth-button"
            :aria-label="currentUser ? 'Sign out' : 'Sign in'"
            :title="currentUser ? 'Sign out' : 'Sign in'"
            @click="handleAuthButton"
          >
            <ion-icon
              :icon="currentUser ? logOutOutline : personCircleOutline"
            ></ion-icon>
          </ion-button>
          <ion-button
            class="add-button"
            aria-label="Report an item"
            @click="openAdd"
          >
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
          <p class="welcome-copy">
            Report a lost or found item and let your community do the searching.
          </p>
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

      <ion-searchbar
        v-model="searchQuery"
        class="report-search"
        placeholder="Search reports"
        :debounce="250"
        show-clear-button="focus"
      />

      <ion-segment v-model="activeFilter" class="filter-segment" scrollable>
        <ion-segment-button value="All">All</ion-segment-button>
        <ion-segment-button value="Lost">Lost</ion-segment-button>
        <ion-segment-button value="Found">Found</ion-segment-button>
        <ion-segment-button value="Unclaimed">Unclaimed</ion-segment-button>
        <ion-segment-button value="Claimed">Claimed</ion-segment-button>
        <ion-segment-button value="Mine" @click="selectMyReports">My Reports</ion-segment-button>
      </ion-segment>

      <ItemList
        :items="filteredItems"
        :empty-message="emptyMessage"
        :current-user-id="currentUser?.uid"
        @select="openDetails"
        @mark-found="handleMarkFound"
        @claim="handleClaim"
        @unclaim="handleUnclaim"
        @delete="requestDelete"
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

    <ion-modal
      :is-open="showDetailsModal"
      @didDismiss="showDetailsModal = false"
    >
      <ReportDetails
        v-if="selectedItem"
        :item="selectedItem"
        :can-edit="selectedItem.ownerId === currentUser?.uid"
        @close="showDetailsModal = false"
        @edit="openEditFromDetails"
      />
    </ion-modal>

    <ion-alert
      :is-open="showDeleteAlert"
      header="Delete report?"
      message="This report will be permanently removed."
      :buttons="deleteAlertButtons"
      @didDismiss="closeDeleteAlert"
    />

    <ion-modal :is-open="showAuthModal" @didDismiss="showAuthModal = false">
      <AuthModal @close="showAuthModal = false" />
    </ion-modal>
  </ion-page>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from "vue";
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
  IonSegment,
  IonSegmentButton,
  IonAlert,
  IonSearchbar,
} from "@ionic/vue";
import { addOutline, logOutOutline, personCircleOutline } from "ionicons/icons";
import { auth } from "@/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useItems } from "@/composables/useItems";

import ItemList from "@/components/ItemList.vue";
import AddItemForm from "@/components/AddItemForm.vue";
import EditItemModal from "@/components/EditItemModal.vue";
import ReportDetails from "@/components/ReportDetails.vue";
import AuthModal from "@/components/AuthModal.vue";

const {
  items,
  subscribeToItems,
  markAsFound,
  markAsClaimed,
  markAsUnclaimed,
  deleteItem,
} = useItems();

const showAddModal = ref(false);
const showEditModal = ref(false);
const showDetailsModal = ref(false);
const selectedItem = ref(null);
const errorMessage = ref("");
const activeFilter = ref("All");
const searchQuery = ref("");
const showDeleteAlert = ref(false);
const pendingDeleteId = ref(null);
const showAuthModal = ref(false);
const currentUser = ref(null);

const filteredItems = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  return items.value.filter((item) => {
    const matchesFilter =
      activeFilter.value === "All" ||
      (activeFilter.value === "Mine" && item.ownerId === currentUser.value?.uid) ||
      (activeFilter.value === "Lost" &&
        item.type === "Lost" &&
        item.status !== "Found") ||
      (activeFilter.value === "Found" &&
        (item.type === "Found" || item.status === "Found")) ||
      (activeFilter.value === "Claimed" && item.status === "Claimed") ||
      (activeFilter.value === "Unclaimed" && item.status === "Unclaimed");
    const searchableText = [
      item.itemName,
      item.description,
      item.location,
      item.type,
      item.status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesFilter && (!query || searchableText.includes(query));
  });
});

const emptyMessage = computed(() =>
  searchQuery.value.trim()
    ? `No reports match “${searchQuery.value.trim()}”.`
    : activeFilter.value === "Mine"
      ? "You have not created any reports yet."
    : activeFilter.value === "All"
      ? "Be the first to report a lost or found item."
      : `No ${activeFilter.value.toLowerCase()} reports yet.`,
);

const deleteAlertButtons = [
  { text: "Cancel", role: "cancel" },
  {
    text: "Delete",
    role: "destructive",
    handler: () => confirmDelete(),
  },
];

let unsubscribe;
let unsubscribeAuth;
onMounted(() => {
  unsubscribe = subscribeToItems((error) => {
    console.error("Unable to read items from Firebase:", error);
    errorMessage.value =
      "Unable to load items. Check your Firebase connection and permissions.";
  });
  unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    currentUser.value = user;
  });
});
onUnmounted(() => {
  if (unsubscribe) unsubscribe();
  if (unsubscribeAuth) unsubscribeAuth();
});

function openAdd() {
  if (currentUser.value) {
    showAddModal.value = true;
  } else {
    showAuthModal.value = true;
  }
}

async function handleAuthButton() {
  if (currentUser.value) {
    await signOut(auth);
    activeFilter.value = "All";
  } else {
    showAuthModal.value = true;
  }
}

function selectMyReports() {
  if (!currentUser.value) {
    activeFilter.value = "All";
    showAuthModal.value = true;
  }
}

function openDetails(item) {
  selectedItem.value = item;
  showDetailsModal.value = true;
}

function openEditFromDetails() {
  showDetailsModal.value = false;
  showEditModal.value = true;
}

async function handleClaim(id) {
  if (!currentUser.value) {
    showAuthModal.value = true;
    return;
  }

  const item = items.value.find((entry) => entry.id === id);
  if (item?.type !== "Found" && item?.status !== "Found") {
    errorMessage.value = "Only found items can be claimed.";
    return;
  }

  await runCrudAction(() => markAsClaimed(id), "claim this item");
}

async function handleMarkFound(id) {
  if (!currentUser.value) {
    showAuthModal.value = true;
    return;
  }

  await runCrudAction(() => markAsFound(id), "mark this item as found");
}

async function handleUnclaim(id) {
  if (!currentUser.value) {
    showAuthModal.value = true;
    return;
  }

  const item = items.value.find((entry) => entry.id === id);
  if (item?.type !== "Found" && item?.status !== "Found") {
    errorMessage.value = "Only found items can be unclaimed.";
    return;
  }

  await runCrudAction(() => markAsUnclaimed(id), "mark this item as unclaimed");
}

function requestDelete(id) {
  pendingDeleteId.value = id;
  showDeleteAlert.value = true;
}

function closeDeleteAlert() {
  showDeleteAlert.value = false;
  pendingDeleteId.value = null;
}

async function confirmDelete() {
  const id = pendingDeleteId.value;
  closeDeleteAlert();

  if (id) {
    await runCrudAction(() => deleteItem(id), "delete this item");
  }
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
.app-header {
  background: var(--ion-background-color);
}
.app-header ion-toolbar {
  --background: var(--ion-background-color);
  --border-width: 0;
  --padding-start: 20px;
  --padding-end: 14px;
  --min-height: 76px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 11px;
}
.brand-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 13px;
  color: #fff;
  background: var(--app-ink);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.eyebrow {
  margin: 0 0 4px;
  color: var(--app-coral);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  line-height: 1;
  text-transform: uppercase;
}
.brand ion-title {
  padding: 0;
  color: var(--app-ink);
  font-size: 18px;
  font-weight: 800;
  text-align: left;
}
.add-button {
  --background: var(--app-coral);
  --border-radius: 14px;
  --color: #fff;
  width: 46px;
  height: 46px;
  margin: 0;
  box-shadow: 0 8px 16px rgba(226, 93, 79, 0.22);
}
.add-button ion-icon {
  font-size: 24px;
}
.auth-button {
  --color: var(--app-ink);
  width: 42px;
  height: 42px;
  margin: 0 4px 0 0;
}
.auth-button ion-icon {
  font-size: 25px;
}
.home-content {
  --padding-bottom: 32px;
}
.welcome-panel,
.section-heading,
.home-content > :deep(ion-list) {
  width: min(calc(100% - 32px), 760px);
  margin-right: auto;
  margin-left: auto;
}
.welcome-panel {
  display: flex;
  align-items: end;
  justify-content: space-between;
  min-height: 184px;
  margin-top: 10px;
  padding: 24px 22px;
  border-radius: 24px;
  color: #fff;
  background: var(--app-ink);
  overflow: hidden;
  position: relative;
}
.welcome-panel::after {
  position: absolute;
  right: -38px;
  top: -42px;
  width: 150px;
  height: 150px;
  border: 22px solid var(--app-yellow);
  border-radius: 50%;
  content: "";
  opacity: 0.9;
}
.welcome-panel h1 {
  max-width: 250px;
  margin: 8px 0 10px;
  font-size: clamp(25px, 7vw, 38px);
  font-weight: 800;
  line-height: 1.03;
}
.welcome-panel h1 em {
  color: var(--app-yellow);
  font-style: normal;
}
.welcome-panel .eyebrow {
  color: #b7dfd0;
}
.welcome-copy {
  max-width: 280px;
  margin: 0;
  color: #b8c7c3;
  font-size: 13px;
  line-height: 1.45;
}
.item-count {
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 1px;
}
.item-count strong {
  color: var(--app-yellow);
  font-size: 34px;
  line-height: 1;
}
.item-count span {
  color: #d9e1de;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.error-banner {
  width: min(calc(100% - 32px), 760px);
  margin: 14px auto 0;
  padding: 12px 14px;
  border: 1px solid #efc2c2;
  border-radius: 12px;
  background: #fff1f1;
  font-size: 13px;
}
.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-top: 28px;
  margin-bottom: 10px;
}
.section-heading h2 {
  margin: 0;
  color: var(--app-ink);
  font-size: 21px;
  font-weight: 800;
}
.report-search {
  width: min(calc(100% - 32px), 760px);
  margin: 0 auto 10px;
  padding: 0;
  --background: var(--app-paper);
  --border-radius: 14px;
  --color: var(--app-ink);
  --icon-color: var(--app-muted);
  --placeholder-color: var(--app-muted);
  border: 1px solid var(--app-line);
  border-radius: 14px;
}
.filter-segment {
  width: min(calc(100% - 32px), 760px);
  margin: 0 auto 14px;
  --background: var(--app-paper);
  border: 1px solid var(--app-line);
  border-radius: 14px;
}
.filter-segment ion-segment-button {
  min-width: 82px;
  min-height: 42px;
  --color: var(--app-muted);
  --color-checked: var(--app-ink);
  --indicator-color: var(--app-yellow);
  font-size: 11px;
  font-weight: 800;
  text-transform: none;
}
.swipe-hint {
  color: var(--app-muted);
  font-size: 11px;
}
@media (min-width: 600px) {
  .welcome-panel {
    min-height: 220px;
    padding: 32px;
  }
}
</style>
