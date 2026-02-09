import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import moment from 'moment'

const API_MASTER_URL = import.meta.env.VITE_API_MASTER_URL

// --- Interfaces ---
export interface NavItem {
  title: string
  icon: string
  to: string
}

export interface MasterItem {
  id: number
  name: string
}

export const useAppStore = defineStore('app', () => {
  // --- UI State ---
  const navItems = ref<NavItem[]>([
    { title: 'General Analysis', icon: 'mdi mdi-chart-arc', to: '/general-analysis' },
    { title: 'Internal Analysis', icon: 'mdi mdi-office-building', to: '/internal-analysis' },
    { title: 'External Analysis', icon: 'mdi mdi-web', to: '/external-analysis' },
    { title: 'Industry Analysis', icon: 'mdi mdi-warehouse', to: '/industry-analysis' },
    { title: 'Channel Analysis', icon: 'mdi-access-point', to: '/channel-analysis' },
  ])

  // --- Date Range State ---
  const startDate = ref(moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00'))
  const endDate = ref(moment().format('YYYY-MM-DD 23:59:59'))

  // --- Analysis Identity ---
  const internalGroup = ref('PT Unilever Indonesia Tbk')

  // --- Master Data (Data dari API) ---
  const masterChannels = ref<string[]>([])
  const masterCategories = ref<string[]>([])
  const masterGroups = ref<string[]>([]) // Menampung SEMUA group dari API

  // --- Logic Filter Eksternal ---
  // Otomatis terupdate jika masterGroups atau internalGroup berubah
  const externalGroups = computed(() => {
    return masterGroups.value.filter(name => name !== internalGroup.value)
  })

  // --- Selected Filters (Pilihan User) ---
  const selectedChannels = ref<string[]>([])
  const selectedCategories = ref<string[]>([])
  const selectedGroups = ref<string[]>([]) 
  const selectedBrands = ref<string[]>([])
  const selectedVariants = ref<string[]>([])
  const selectedSubCategories = ref<string[]>([])

  // --- Actions ---
  function setDateRange(dates: { from: string; to: string }) {
    startDate.value = dates.from
    endDate.value = dates.to
  }

  /**
   * Mengambil data master untuk filter secara paralel
   */
  async function fetchMasterFilters() {
    try {
      // Jalankan semua request secara bersamaan
      const [channelRes, categoryRes, groupRes] = await Promise.all([
        fetch(`${API_MASTER_URL}/api/master/channel/all`),
        fetch(`${API_MASTER_URL}/api/master/category/all`),
        fetch(`${API_MASTER_URL}/api/master/group/all`)
      ])

      // Parse JSON jika request berhasil
      const [channelData, categoryData, groupData] = await Promise.all([
        channelRes.ok ? channelRes.json() : Promise.resolve([]),
        categoryRes.ok ? categoryRes.json() : Promise.resolve([]),
        groupRes.ok ? groupRes.json() : Promise.resolve([])
      ])

      // Mapping data ke state
      masterChannels.value = (channelData as MasterItem[]).map(item => item.name)
      masterCategories.value = (categoryData as MasterItem[]).map(item => item.name)
      masterGroups.value = (groupData as MasterItem[]).map(item => item.name)

    } catch (error) {
      console.error('Error fetching master filters:', error)
      // Reset state jika terjadi error fatal
      masterChannels.value = []
      masterCategories.value = []
      masterGroups.value = []
    }
  }

  /**
   * Reset semua pilihan filter ke kosong
   */
  function resetFilters() {
    selectedChannels.value = []
    selectedCategories.value = []
    selectedGroups.value = []
    selectedBrands.value = []
    selectedVariants.value = []
    selectedSubCategories.value = []
  }

  return {
    // UI & Date
    navItems,
    startDate,
    endDate,
    setDateRange,

    // Identity
    internalGroup,
    
    // Master Data
    masterChannels,
    masterCategories,
    masterGroups,
    externalGroups, // Hasil filter otomatis
    fetchMasterFilters,
    resetFilters,

    // User Selection
    selectedGroups,
    selectedChannels,
    selectedCategories,
    selectedBrands,
    selectedVariants,
    selectedSubCategories
  }
})