<template>
  <ion-list>
    <ion-item-sliding v-for="entry in items" :key="entry.id">
      <ion-item button @click="$emit('select', entry)">
        <ion-label>
          <h2>{{ entry.itemName }}</h2>
          <p>{{ entry.type }} · {{ entry.location }} · {{ entry.date }}</p>
        </ion-label>
        <ion-badge :color="entry.status === 'Claimed' ? 'success' : 'warning'" slot="end">
          {{ entry.status }}
        </ion-badge>
      </ion-item>

      <ion-item-options side="end">
        <ion-item-option
          v-if="entry.status === 'Unclaimed'"
          color="success"
          @click="$emit('claim', entry.id)">
          Claim
        </ion-item-option>
        <ion-item-option color="danger" @click="$emit('delete', entry.id)">
          Delete
        </ion-item-option>
      </ion-item-options>
    </ion-item-sliding>
  </ion-list>

  <ion-text color="medium" v-if="items.length === 0">
    <p class="ion-padding">No items yet.</p>
  </ion-text>
</template>

<script setup>
import {
  IonList, IonItemSliding, IonItem, IonLabel, IonBadge,
  IonItemOptions, IonItemOption, IonText
} from '@ionic/vue';

defineProps({ items: { type: Array, required: true } });
defineEmits(['select', 'claim', 'delete']);
</script>