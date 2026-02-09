<template>
  <v-card class="pa-0 pb-4 rounded-lg overflow-hidden d-flex flex-column" color="surface" style="height: 100%;">
    
    <div class="d-flex flex-wrap align-center pa-4 ga-4">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-0">
        {{ title }}
      </v-card-title>
      <v-spacer></v-spacer>
      </div>

    <v-divider class="mb-4"></v-divider>

    <v-card-text class="pa-4 d-flex flex-column flex-grow-1">
      <div 
        class="bubble-area" 
        ref="canvasArea"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <v-overlay v-if="isLoading" contained class="align-center justify-center">
          <v-progress-circular indeterminate color="purple"></v-progress-circular>
        </v-overlay>

        <div 
          v-for="(bubble, index) in floatingBubbles" 
          :key="index"
          class="floating-balloon"
          :class="{ 'is-dragging': draggedIndex === index }"
          @mousedown="handleMouseDown($event, index)"
          @touchstart="handleMouseDown($event, index)"
          :style="{
            width: bubble.size + 'px',
            height: bubble.size + 'px',
            background: `radial-gradient(circle at 30% 30%, ${bubble.color}CC, #121212)`,
            boxShadow: `0 0 20px ${bubble.color}33, inset 0 0 15px rgba(255,255,255,0.1)`,
            border: `1px solid ${bubble.color}66`,
            transform: `translate3d(${bubble.x}px, ${bubble.y}px, 0)`,
            zIndex: draggedIndex === index ? 100 : 10
          }"
        >
          <div class="bubble-content" :style="{ transform: `scale(${Math.max(bubble.size / 135, 0.75)})` }">
            <div class="brand-name">{{ bubble.label }}</div>
            <div class="mention-count">{{ bubble.totalMention.toLocaleString() }}</div>
          </div>
        </div>
      </div>

      <v-divider class="my-4"></v-divider>
      
      
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

const props = defineProps<{
  title: string;
  data: any;
  isLoading: boolean;
}>();

interface Bubble {
  label: string;
  totalMention: number;
  size: number;
  color: string;
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
}

const canvasArea = ref<HTMLElement | null>(null);
const floatingBubbles = ref<Bubble[]>([]);
const draggedIndex = ref<number | null>(null);
let animationFrame: number;
let resizeObserver: ResizeObserver | null = null;

const SPRING_STIFFNESS = 0.05; 
const DAMPING = 0.8;
const REPULSION = 0.6; 
const MIN_SIZE = 100;  
const MAX_SIZE = 180; 

// Hitung total brand dan total mention
const totalBrands = computed(() => floatingBubbles.value.length);
const totalMentions = computed(() => {
  return floatingBubbles.value.reduce((acc, curr) => acc + curr.totalMention, 0);
});

const initBubbles = () => {
  if (!props.data?.datasets || !canvasArea.value) return;
  
  const rect = canvasArea.value.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  
  const processedData = props.data.datasets.map((ds: any) => ({
    ...ds,
    total: ds.data.reduce((sum: number, pt: any) => sum + (pt.x || 0), 0)
  }));

  const allTotals = processedData.map((d: any) => d.total);
  const maxVal = Math.max(...allTotals);
  const minVal = Math.min(...allTotals);

  processedData.sort((a: any, b: any) => b.total - a.total);

  floatingBubbles.value = processedData.map((ds: any, i: number) => {
    let size = (MIN_SIZE + MAX_SIZE) / 2;
    if (maxVal !== minVal) {
      size = MIN_SIZE + ((ds.total - minVal) / (maxVal - minVal)) * (MAX_SIZE - MIN_SIZE);
    }

    const phi = i * 137.5 * (Math.PI / 180);
    const r = i === 0 ? 0 : (size * 0.75) * Math.sqrt(i + 1); 
    
    const homeX = centerX + r * Math.cos(phi) - size / 2;
    const homeY = centerY + r * Math.sin(phi) - size / 2;

    return {
      label: ds.label,
      totalMention: ds.total,
      size,
      color: ds.backgroundColor || '#A855F7',
      x: homeX,
      y: homeY,
      originX: homeX,
      originY: homeY,
      vx: 0,
      vy: 0,
    };
  });
};

const updateLayoutCenters = () => {
  if (!canvasArea.value || floatingBubbles.value.length === 0) return;
  const rect = canvasArea.value.getBoundingClientRect();
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  floatingBubbles.value.forEach((b, i) => {
    const phi = i * 137.5 * (Math.PI / 180);
    const r = i === 0 ? 0 : (b.size * 0.75) * Math.sqrt(i + 1);
    b.originX = centerX + r * Math.cos(phi) - b.size / 2;
    b.originY = centerY + r * Math.sin(phi) - b.size / 2;
  });
};

const handleMouseDown = (_e: Event, index: number) => { draggedIndex.value = index; };
const handleMouseMove = (e: MouseEvent) => {
  if (!canvasArea.value || draggedIndex.value === null) return;
  const rect = canvasArea.value.getBoundingClientRect();
  const b = floatingBubbles.value[draggedIndex.value];
  if (b) {
    b.x = e.clientX - rect.left - b.size / 2;
    b.y = e.clientY - rect.top - b.size / 2;
  }
};
const handleMouseUp = () => { draggedIndex.value = null; };

const animate = () => {
  const bubbles = floatingBubbles.value as Bubble[]
  if (!canvasArea.value) return

  const areaWidth = canvasArea.value.clientWidth
  const areaHeight = canvasArea.value.clientHeight
  const currentDragged = draggedIndex.value

  bubbles.forEach((b1: Bubble, i: number) => {
    if (currentDragged !== i) {
      const dx = b1.originX - b1.x
      const dy = b1.originY - b1.y
      b1.vx += dx * SPRING_STIFFNESS
      b1.vy += dy * SPRING_STIFFNESS
    }

    for (let j = i + 1; j < bubbles.length; j++) {
      const b2 = bubbles[j] as Bubble
      const dx = (b2.x + b2.size / 2) - (b1.x + b1.size / 2)
      const dy = (b2.y + b2.size / 2) - (b1.y + b1.size / 2)
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDist = b1.size / 2 + b2.size / 2 + 5

      if (distance < minDist && distance > 0) {
        const angle = Math.atan2(dy, dx)
        const force = (minDist - distance) * REPULSION
        const fx = Math.cos(angle) * force
        const fy = Math.sin(angle) * force

        if (currentDragged !== i) {
          b1.vx -= fx
          b1.vy -= fy
        }
        if (currentDragged !== j) {
          b2.vx += fx
          b2.vy += fy
        }
      }
    }

    b1.vx *= DAMPING
    b1.vy *= DAMPING

    if (currentDragged !== i) {
      b1.x += b1.vx
      b1.y += b1.vy

      if (b1.x < 0) { b1.x = 0; b1.vx *= -0.5 }
      else if (b1.x + b1.size > areaWidth) {
        b1.x = areaWidth - b1.size
        b1.vx *= -0.5
      }

      if (b1.y < 0) { b1.y = 0; b1.vy *= -0.5 }
      else if (b1.y + b1.size > areaHeight) {
        b1.y = areaHeight - b1.size
        b1.vy *= -0.5
      }
    }
  })

  animationFrame = requestAnimationFrame(animate)
}

onMounted(() => {
  setTimeout(initBubbles, 150); animate();
  if (canvasArea.value) {
    resizeObserver = new ResizeObserver(() => { updateLayoutCenters(); });
    resizeObserver.observe(canvasArea.value);
  }
});
onUnmounted(() => { cancelAnimationFrame(animationFrame); if (resizeObserver) resizeObserver.disconnect(); });
watch(() => props.data, initBubbles, { deep: true });
</script>

<style scoped>

.d-flex.justify-center {
  gap: 16px;
}

.stat-tag {
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgba(var(--v-theme-on-surface), 0.87);
  padding: 10px 24px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

/* Gaya khusus Mentions (Warna Biru) */
.stat-tag.dark-blue {
  background: #1976D2; /* Biru Vuetify */
  color: white;
  border: none;
  box-shadow: 0 6px 18px rgba(25, 118, 210, 0.3);
}

.tag-label {
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.8;
}

.tag-val {
  font-size: 20px;
  font-weight: 900;
}

.bubble-area {
  width: 100%;
  height: 650px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  touch-action: none;
}

.floating-balloon {
  position: absolute;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: grab;
  will-change: transform;
  user-select: none;
  transition: box-shadow 0.3s ease;
}

.is-dragging {
  cursor: grabbing;
  box-shadow: 0 0 50px rgba(255,255,255,0.3) !important;
}

.bubble-content {
  text-align: center;
  pointer-events: none;
  width: 100%;
  padding: 8px;
}

.brand-name { 
  font-size: 18px; 
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.9);
  margin-bottom: 2px;
  text-transform: uppercase;
}

.mention-count { 
  font-size: 18px; 
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0,0,0,0.9);
}
</style>