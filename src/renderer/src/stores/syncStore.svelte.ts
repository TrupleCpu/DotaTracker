class SyncStore {
  synced = $state(0)
  total = $state(0)
  status = $state<'idle' | 'syncing' | 'complete' | 'error'>('idle')

  constructor() {
    if (typeof window !== 'undefined' && window.api) {
      window.api.onSyncProgress((data) => {
        this.synced = data.synced
        this.total = data.total
        this.status = data.status as typeof this.status
      })

      window.api.onSyncComplete((data) => {
        this.synced = data.synced
        this.total = data.total
        this.status = 'complete'
      })
    }
  }

  get percent(): number {
    if (this.total === 0) return 0
    return Math.min(100, Math.round((this.synced / this.total) * 100))
  }

  get isComplete(): boolean {
    return this.status === 'complete'
  }

  get isSyncing(): boolean {
    return this.status === 'syncing'
  }

  async startSync(steamId: number): Promise<void> {
    if (this.isSyncing) return
    await window.api.startFullSync(steamId)
  }

  async refreshStats(steamId: number): Promise<void> {
    const syncProgress = await window.api.getSyncProgress(steamId)
    this.synced = syncProgress.synced
    this.total = syncProgress.total
    this.status = syncProgress.status as typeof this.status
  }
}

export const syncStore = new SyncStore()
