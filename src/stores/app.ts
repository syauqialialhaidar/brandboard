import { defineStore } from 'pinia'
import { ref } from 'vue'
import moment from 'moment'

const API_MASTER_URL = import.meta.env.VITE_API_MASTER_URL

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
  const navItems = ref<NavItem[]>([
    { title: 'General Analysis', icon: 'mdi mdi-chart-arc', to: '/general-analysis' },
    { title: 'Internal Analysis', icon: 'mdi mdi-office-building', to: '/internal-analysis' },
    { title: 'External Analysis', icon: 'mdi mdi-web', to: '/external-analysis' },
    { title: 'Industry Analysis', icon: 'mdi mdi-warehouse', to: '/industry-analysis' },
    { title: 'Channel Analysis', icon: 'mdi-access-point', to: '/channel-analysis' },
  ])

  const startDate = ref(moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00'))
  const endDate = ref(moment().format('YYYY-MM-DD 23:59:59'))
  
  // 1. Identitas Internal Group
  const internalGroup = ref('PT Unilever Indonesia Tbk')

  // 2. State Baru: Menyimpan daftar grup Eksternal (Semua kecuali Internal)
  const externalGroups = ref<string[]>([])

  // --- State untuk Master Data (Pilihan Filter) ---
  const masterChannels = ref<string[]>([])
  const masterCategories = ref<string[]>([])
  
  // --- State untuk Pilihan User (Selected Filters) ---
  const selectedChannels = ref<string[]>([])
  const selectedCategories = ref<string[]>([])
  const selectedGroups = ref<string[]>([]) 
  const selectedBrands = ref<string[]>([])
  const selectedVariants = ref<string[]>([])
  const selectedSubCategories = ref<string[]>([])

  function setDateRange(dates: { from: string; to: string }) {
    startDate.value = dates.from
    endDate.value = dates.to
  }

  async function fetchMasterFilters() {
    try {
      // Fetch Channels
      const channelRes = await fetch(`${API_MASTER_URL}/api/master/channel/all`)
      if (!channelRes.ok) throw new Error('Failed to fetch channels')
      const channelData: MasterItem[] = await channelRes.json()
      masterChannels.value = channelData.map(item => item.name)

      // Fetch Categories
      const categoryRes = await fetch(`${API_MASTER_URL}/api/master/category/all`)
      if (!categoryRes.ok) throw new Error('Failed to fetch categories')
      const categoryData: MasterItem[] = await categoryRes.json()
      masterCategories.value = categoryData.map(item => item.name)

      // === TAMBAHAN BARU: Fetch Groups & Filter External ===
      // Asumsi endpoint master group ada di /api/master/group/all (sesuaikan jika beda)
      const groupRes = await fetch(`${API_MASTER_URL}/api/master/group/all`)
      if (!groupRes.ok) throw new Error('Failed to fetch groups')
      const groupData: MasterItem[] = await groupRes.json()
      
      // LOGIKA FILTER: Ambil semua nama, kecuali nama internalGroup
      externalGroups.value = groupData
        .map(item => item.name)
        .filter(name => name !== internalGroup.value)

    } catch (error) {
      console.error('Error fetching master filters:', error)
      masterChannels.value = []
      masterCategories.value = []
      externalGroups.value = [] // Reset jika error
    }
  }

  return {
    navItems,
    startDate,
    endDate,
    setDateRange,
    masterChannels,
    masterCategories,
    fetchMasterFilters,
    
    internalGroup,
    externalGroups, 
    
    selectedGroups,
    selectedChannels,
    selectedCategories,
    selectedBrands,
    selectedVariants,
    selectedSubCategories
  }
})