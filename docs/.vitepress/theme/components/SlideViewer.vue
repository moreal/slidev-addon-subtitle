<script setup lang="ts">
import { ref, shallowRef, watchEffect, onMounted, onUnmounted } from "vue";
import { withBase } from "vitepress";

const props = defineProps<{ src: string }>();

const PdfComponent = shallowRef<any>(null);
const pdf = shallowRef<any>(null);
const pages = ref(0);
const currentPage = ref(1);

function prev() {
  if (currentPage.value > 1) currentPage.value--;
}

function next() {
  if (currentPage.value < pages.value) currentPage.value++;
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "ArrowLeft") prev();
  else if (e.key === "ArrowRight") next();
}

onMounted(async () => {
  const { VuePDF, usePDF } = await import("@tato30/vue-pdf");
  PdfComponent.value = VuePDF;

  const result = usePDF(withBase(props.src));
  watchEffect(() => {
    pdf.value = result.pdf.value;
    pages.value = result.pages.value;
  });

  window.addEventListener("keydown", onKeydown);
});

onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<template>
  <div class="slide-viewer">
    <div class="slide-viewer-canvas">
      <component
        v-if="PdfComponent && pdf"
        :is="PdfComponent"
        :pdf="pdf"
        :page="currentPage"
        fit-parent
      />
    </div>
    <div class="slide-viewer-controls">
      <button :disabled="currentPage <= 1" @click="prev">&#9664; Prev</button>
      <span class="slide-viewer-indicator">{{ currentPage }} / {{ pages }}</span>
      <button :disabled="currentPage >= pages" @click="next">Next &#9654;</button>
    </div>
  </div>
</template>

<style scoped>
.slide-viewer {
  margin: 1.5rem 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.slide-viewer-canvas {
  width: 100%;
  background: #000;
}

.slide-viewer-canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: auto !important;
}

.slide-viewer-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 0.6rem 0;
  background: var(--vp-c-bg-soft);
}

.slide-viewer-controls button {
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.85rem;
}

.slide-viewer-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.slide-viewer-controls button:not(:disabled):hover {
  background: var(--vp-c-bg-mute);
}

.slide-viewer-indicator {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  min-width: 4rem;
  text-align: center;
}
</style>
