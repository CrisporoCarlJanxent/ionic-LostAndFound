import { ref } from "vue";
import { db } from "../firebase";
import {
  ref as databaseRef,
  push,
  set,
  update,
  remove,
  onValue,
  serverTimestamp,
} from "firebase/database";

const itemsRef = databaseRef(db, "items");

export function useItems() {
  const items = ref([]);

  // Read (real-time listener)
  function subscribeToItems(onError) {
    return onValue(
      itemsRef,
      (snapshot) => {
        const data = snapshot.val() || {};
        items.value = Object.entries(data).map(([id, item]) => ({
          id,
          ...item,
        }));
      },
      onError,
    );
  }

  // Create
  async function addItem(item) {
    const newItemRef = push(itemsRef);
    await set(newItemRef, {
      ...item,
      createdAt: serverTimestamp(),
    });
    return newItemRef.key;
  }

  // Update
  async function updateItem(id, data) {
    return update(databaseRef(db, `items/${id}`), data);
  }

  // Delete
  async function deleteItem(id) {
    return remove(databaseRef(db, `items/${id}`));
  }

  // Convenience: quick status update
  async function markAsClaimed(id) {
    return update(databaseRef(db, `items/${id}`), { status: "Claimed" });
  }

  return {
    items,
    subscribeToItems,
    addItem,
    updateItem,
    deleteItem,
    markAsClaimed,
  };
}
