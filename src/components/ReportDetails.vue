<template>
  <ion-header class="details-header ion-no-border">
    <ion-toolbar>
      <ion-title>Report details</ion-title>
      <ion-buttons slot="end">
        <ion-button @click="emit('close')">Close</ion-button>
      </ion-buttons>
    </ion-toolbar>
  </ion-header>

  <ion-content class="details-content ion-padding">
    <div class="details-card">
      <img
        v-if="item.imageUrl"
        class="details-image"
        :src="item.imageUrl"
        alt="Reported item"
      />
      <div v-else class="details-placeholder">
        <ion-icon
          :icon="item.type === 'Found' ? checkmarkCircleOutline : searchOutline"
        />
      </div>

      <div class="details-heading">
        <div>
          <p class="details-eyebrow">{{ item.type }} item</p>
          <h1>{{ item.itemName }}</h1>
        </div>
        <ion-badge
          v-if="item.type === 'Found' || item.status === 'Found'"
          :color="item.status === 'Claimed' ? 'success' : 'warning'"
        >
          {{ item.status }}
        </ion-badge>
      </div>

      <p class="details-description">
        {{ item.description || "No description was added." }}
      </p>

      <dl class="details-meta">
        <div>
          <dt>Location</dt>
          <dd>{{ item.location || "Not added" }}</dd>
        </div>
        <div>
          <dt>Date</dt>
          <dd>{{ item.date || "Not added" }}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{{ item.time || "Not added" }}</dd>
        </div>
      </dl>

      <ion-button
        v-if="canEdit"
        expand="block"
        class="edit-button"
        @click="emit('edit')"
      >
        Edit report
      </ion-button>
    </div>
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
  IonIcon,
  IonBadge,
} from "@ionic/vue";
import { checkmarkCircleOutline, searchOutline } from "ionicons/icons";

defineProps({
  item: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
});
const emit = defineEmits(["close", "edit"]);
</script>

<style scoped>
.details-header {
  background: var(--app-paper);
}
.details-header ion-toolbar {
  --background: var(--app-paper);
  --border-width: 0;
  --padding-start: 20px;
  --padding-end: 12px;
  --min-height: 68px;
}
.details-header ion-title {
  padding: 0;
  color: var(--app-ink);
  font-size: 21px;
  font-weight: 800;
  text-align: left;
}
.details-header ion-button {
  --color: var(--app-ink);
  font-size: 13px;
  font-weight: 700;
  text-transform: none;
}
.details-content {
  --background: var(--app-paper);
}
.details-card {
  max-width: 520px;
  margin: 0 auto;
}
.details-image,
.details-placeholder {
  width: 100%;
  height: min(55vw, 280px);
  border-radius: 18px;
  object-fit: cover;
}
.details-placeholder {
  display: grid;
  place-items: center;
  color: var(--app-coral);
  background: #fde5df;
}
.details-placeholder ion-icon {
  font-size: 64px;
}
.details-heading {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
}
.details-eyebrow {
  margin: 0 0 5px;
  color: var(--app-coral);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}
.details-heading h1 {
  margin: 0;
  color: var(--app-ink);
  font-size: 28px;
  line-height: 1.1;
}
.details-heading ion-badge {
  flex: 0 0 auto;
  margin-top: 3px;
  border-radius: 20px;
  font-size: 10px;
  text-transform: uppercase;
}
.details-description {
  margin: 20px 0;
  color: var(--app-muted);
  font-size: 15px;
  line-height: 1.55;
}
.details-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 0;
}
.details-meta div {
  padding: 13px;
  border: 1px solid var(--app-line);
  border-radius: 14px;
  background: #f7f4ef;
}
.details-meta div:first-child {
  grid-column: 1 / -1;
}
.details-meta dt {
  color: var(--app-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.details-meta dd {
  margin: 4px 0 0;
  color: var(--app-ink);
  font-size: 14px;
  font-weight: 700;
}
.edit-button {
  --border-radius: 14px;
  height: 52px;
  margin-top: 20px;
  font-weight: 800;
  text-transform: none;
}
@media (max-width: 360px) {
  .details-meta {
    grid-template-columns: 1fr;
  }
  .details-meta div:first-child {
    grid-column: auto;
  }
}
</style>
