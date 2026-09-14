<template>
  <ion-list class="report-list">
    <ion-item-sliding v-for="entry in items" :key="entry.id">
      <ion-item class="report-item" button @click="$emit('select', entry)">
        <div
          class="type-marker"
          :class="entry.type === 'Found' ? 'is-found' : 'is-lost'"
          slot="start"
        >
          {{ entry.type === "Found" ? "+" : "?" }}
        </div>
        <ion-label>
          <div class="item-heading">
            <h2>{{ entry.itemName }}</h2>
            <ion-badge
              :color="entry.status === 'Claimed' ? 'success' : 'warning'"
              >{{ entry.status }}</ion-badge
            >
          </div>
          <p class="item-meta">
            <span>{{ entry.type }}</span
            ><span>{{ entry.location || "Location not added" }}</span>
          </p>
          <p class="item-date">
            {{ entry.date || "Date not added"
            }}<span v-if="entry.time"> at {{ entry.time }}</span>
          </p>
        </ion-label>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option
          v-if="entry.status === 'Unclaimed'"
          color="success"
          @click="$emit('claim', entry.id)"
        >
          Claim
        </ion-item-option>
        <ion-item-option color="danger" @click="$emit('delete', entry.id)">
          Delete
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  </ion-list>

  <ion-text class="empty-state" color="medium" v-if="items.length === 0">
    <div class="empty-icon">+</div>
    <h3>No reports yet</h3>
    <p>Be the first to report a lost or found item.</p>
  </ion-text>
</template>

<script setup>
import {
  IonList,
  IonItemSliding,
  IonItem,
  IonLabel,
  IonBadge,
  IonItemOptions,
  IonItemOption,
  IonText,
} from "@ionic/vue";

defineProps({ items: { type: Array, required: true } });
defineEmits(["select", "claim", "delete"]);
</script>

<style scoped>
.report-list {
  padding: 0;
  background: transparent;
}
.report-list ion-item-sliding {
  display: block;
  margin-bottom: 10px;
  border-radius: 18px;
  background: var(--app-paper);
  box-shadow: 0 7px 18px rgba(32, 43, 43, 0.06);
  overflow: hidden;
}
.report-item {
  --background: var(--app-paper);
  --border-width: 0;
  --inner-padding-end: 14px;
  --min-height: 88px;
  --padding-start: 14px;
  --ripple-color: var(--app-mint);
}
.type-marker {
  display: grid;
  width: 44px;
  height: 44px;
  margin-right: 12px;
  place-items: center;
  border-radius: 14px;
  font-size: 23px;
  font-weight: 500;
}
.type-marker.is-lost {
  color: var(--app-coral);
  background: #fde5df;
}
.type-marker.is-found {
  color: #26765d;
  background: var(--app-mint);
}
.item-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.item-heading h2 {
  overflow: hidden;
  margin: 0;
  color: var(--app-ink);
  font-size: 16px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-heading ion-badge {
  flex: 0 0 auto;
  --padding-end: 8px;
  --padding-start: 8px;
  border-radius: 20px;
  font-size: 9px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.item-meta,
.item-date {
  overflow: hidden;
  margin: 5px 0 0;
  color: var(--app-muted);
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-meta span + span::before {
  margin: 0 6px;
  color: #7d8985;
  content: "•";
}
.item-date {
  margin-top: 3px;
  color: #5f6b68;
  font-size: 11px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: min(calc(100% - 32px), 760px);
  margin: 48px auto;
  text-align: center;
}
.empty-icon {
  display: grid;
  width: 58px;
  height: 58px;
  place-items: center;
  border-radius: 18px;
  color: var(--app-coral);
  background: #fde5df;
  font-size: 30px;
}
.empty-state h3 {
  margin: 14px 0 4px;
  color: var(--app-ink);
  font-size: 18px;
}
.empty-state p {
  margin: 0;
  color: var(--app-muted);
  font-size: 13px;
}
.report-list ion-item-options {
  border-radius: 0 18px 18px 0;
}
</style>
