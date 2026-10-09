import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db, getUid } from './firebase.js';

function tasksCol() {
  return collection(db, 'users', getUid(), 'tasks');
}

function taskDoc(taskId) {
  return doc(db, 'users', getUid(), 'tasks', taskId);
}

export function generateId() {
  return doc(collection(db, '_')).id;
}

export async function addTask(text, dueAt = null, isUrgent = false) {
  const id = generateId();
  const task = {
    text,
    createdAt: Date.now(),
    completedAt: null,
    status: 'active',
    isAdHoc: false,
    isUrgent,
    dueAt,
    dismissCount: 0,
    lastDismissedAt: null,
    lastSurfacedAt: null,
  };
  await setDoc(taskDoc(id), task);
  return { id, ...task };
}

export async function addAdHocTask(text) {
  const id = generateId();
  const now = Date.now();
  const task = {
    text,
    createdAt: now,
    completedAt: now,
    status: 'completed',
    isAdHoc: true,
    dueAt: null,
    dismissCount: 0,
    lastDismissedAt: null,
    lastSurfacedAt: null,
  };
  await setDoc(taskDoc(id), task);
  return { id, ...task };
}

export async function completeTask(taskId) {
  await updateDoc(taskDoc(taskId), {
    status: 'completed',
    completedAt: Date.now(),
  });
}

export async function dismissTask(taskId, currentDismissCount) {
  await updateDoc(taskDoc(taskId), {
    dismissCount: (currentDismissCount || 0) + 1,
    lastDismissedAt: Date.now(),
  });
}

export async function surfaceTask(taskId) {
  await updateDoc(taskDoc(taskId), {
    lastSurfacedAt: Date.now(),
  });
}

export async function updateTask(taskId, updates) {
  await updateDoc(taskDoc(taskId), updates);
}

export async function deleteTask(taskId) {
  await deleteDoc(taskDoc(taskId));
}

export async function loadActiveTasks() {
  try {
    const q = query(tasksCol(), where('status', '==', 'active'));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function loadCompletedTasks() {
  try {
    const q = query(tasksCol(), where('status', '==', 'completed'));
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  } catch {
    return [];
  }
}

export async function loadAllTasks() {
  try {
    const snapshot = await getDocs(tasksCol());
    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}
