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
  const internalGroup = ref('PT Unilever Indonesia Tbk')

  const masterChannels = ref<string[]>([])
  const masterCategories = ref<string[]>([])
  const selectedChannels = ref<string[]>([])
  const selectedCategories = ref<string[]>([])

  function setDateRange(dates: { from: string; to: string }) {
    startDate.value = dates.from
    endDate.value = dates.to
  }

  async function fetchMasterFilters() {
    try {
      const channelRes = await fetch(`${API_MASTER_URL}/api/master/channel/all`)
      if (!channelRes.ok) throw new Error('Failed to fetch channels')
      const channelData: MasterItem[] = await channelRes.json()
      masterChannels.value = channelData.map(item => item.name)

      const categoryRes = await fetch(`${API_MASTER_URL}/api/master/category/all`)
      if (!categoryRes.ok) throw new Error('Failed to fetch categories')
      const categoryData: MasterItem[] = await categoryRes.json()
      masterCategories.value = categoryData.map(item => item.name)
    } catch (error) {
      console.error('Error fetching master filters:', error)
      masterChannels.value = []
      masterCategories.value = []
    }
  }

  return {
    navItems,
    startDate,
    endDate,
    setDateRange,
    masterChannels,
    masterCategories,
    selectedChannels,
    selectedCategories,
    fetchMasterFilters,
    internalGroup,
  }
})
