<template>
  <TableMinim 
    title="Top Program" 
    :headers="['Name', 'Mention']" 
    :rows="rows" 
    :per-page="5" 
    class="h-100 rounded-xl" 
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TableMinim from '@/page-components/TableMinim.vue';

const rows = ref([
  { name: 'Ikatan Cinta', mention: '85%' },
  { name: 'Preman Pensiun', mention: '72%' },
  { name: 'Dahsyat', mention: '60%' },
  { name: 'MasterChef Indonesia', mention: '55%' },
  { name: 'Amanah Wali', mention: '48%' },
]);
</script>