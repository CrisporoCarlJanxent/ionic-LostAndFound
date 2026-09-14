import { ref } from "vue";
import { auth, db } from "../firebase";
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
  async function addItem(item, imageDataUrl = "") {
    if (!auth.currentUser) {
      throw new Error("auth-required");
    }

    const newItemRef = push(itemsRef);

    await set(newItemRef, {
      ...item,
      imageUrl: imageDataUrl,
      ownerId: auth.currentUser.uid,
      ownerEmail: auth.currentUser.email || "",
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
  async function markAsFound(id) {
    return update(databaseRef(db, `items/${id}`), {
      type: "Found",
      status: "Unclaimed",
    });
  }

  async function markAsClaimed(id) {
    const item = items.value.find((entry) => entry.id === id);
    if (item?.type !== "Found" && item?.status !== "Found") {
      throw new Error("only-found-items-can-be-claimed");
    }

    return update(databaseRef(db, `items/${id}`), {
      type: "Found",
      status: "Claimed",
    });
  }

  async function markAsUnclaimed(id) {
    const item = items.value.find((entry) => entry.id === id);
    if (item?.type !== "Found" && item?.status !== "Found") {
      throw new Error("only-found-items-can-be-unclaimed");
    }

    return update(databaseRef(db, `items/${id}`), {
      type: "Found",
      status: "Unclaimed",
    });
  }

  return {
    items,
    subscribeToItems,
    addItem,
    updateItem,
    deleteItem,
    markAsFound,
    markAsClaimed,
    markAsUnclaimed,
  };
}
