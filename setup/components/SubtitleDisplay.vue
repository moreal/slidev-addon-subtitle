<script setup lang="ts">
import { useSlideContext } from "@slidev/client";
import {
  defaultOptions,
  parseNoteToSubtitleTimeline,
  type SubtitleEntry,
} from "slidev-addon-subtitle";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const { $clicks, $clicksContext: clicks, $renderContext, $route } = useSlideContext();

const registrationId = `slidev-addon-subtitle-${Math.random().toString(36).slice(2, 10)}`;
const baseOffset = ref(0);
let stopWatch: (() => void) | undefined;

const note = computed(() => $route?.meta.slide?.note ?? "");

const timeline = computed<SubtitleEntry[]>(() => {
  return parseNoteToSubtitleTimeline(note.value, defaultOptions);
});

function resolveOffsetDelta(items: SubtitleEntry[]): number {
  if (items.length === 0) return 0;

  const maxStart = items[items.length - 1].start;
  const occupied = new Set(items.map((item) => item.start).filter((start) => start >= 1));

  let firstAvailable = 1;
  while (firstAvailable <= maxStart && occupied.has(firstAvailable)) {
    firstAvailable += 1;
  }

  return firstAvailable - 1;
}

function registerTimeline() {
  clicks.unregister(registrationId);

  baseOffset.value = clicks.currentOffset;

  const items = timeline.value;
  const lastStart = items.length > 0 ? items[items.length - 1].start : -1;
  if (lastStart > 0) {
    const delta = resolveOffsetDelta(items);
    clicks.register(registrationId, {
      max: baseOffset.value + lastStart,
      delta,
    });
  }
}

onMounted(() => {
  registerTimeline();
  stopWatch = watch(
    timeline,
    () => {
      registerTimeline();
    },
    { deep: true },
  );
});

onUnmounted(() => {
  if (stopWatch) stopWatch();
  clicks.unregister(registrationId);
});

const localClicks = computed(() => $clicks.value - baseOffset.value);

const activeSubtitle = computed(() => {
  const items = timeline.value;
  if (items.length === 0) return "";

  const click = localClicks.value;
  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const next = items[i + 1];
    const endExclusive = next ? next.start : current.start + 1;

    if (click >= current.start && click < endExclusive) {
      return current.text;
    }
  }

  return "";
});

const shouldRender = computed(() => {
  if (!activeSubtitle.value) return false;
  return $renderContext.value === "slide";
});
</script>

<template>
  <Transition name="subtitle-fade">
    <div v-if="shouldRender" class="pdf-subtitle">
      {{ activeSubtitle }}
    </div>
  </Transition>
</template>

<style scoped>
.subtitle-fade-enter-active,
.subtitle-fade-leave-active {
  transition: opacity 0.18s ease;
}

.subtitle-fade-enter-from,
.subtitle-fade-leave-to {
  opacity: 0;
}

.pdf-subtitle {
  white-space: pre-line;
}
</style>
