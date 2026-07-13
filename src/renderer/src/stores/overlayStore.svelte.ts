class OverlayStore {
  gpm = $state(0)
  xpm = $state(0)
  kills = $state(0)
  clock = $state(0)

  b_gpm = $state(0)
  b_xpm = $state(0)
  b_kpm = $state(0)

  minutes = $derived(this.clock > 0 ? this.clock / 60 : 0)
  kpm_calc = $derived(this.minutes > 0 ? this.kills / this.minutes : 0)

  gpm_diff = $derived(this.b_gpm > 0 ? ((this.gpm - this.b_gpm) / this.b_gpm) * 100 : 0)
  xpm_diff = $derived(this.b_xpm > 0 ? ((this.xpm - this.b_xpm) / this.b_xpm) * 100 : 0)
  kpm_diff = $derived(this.b_kpm > 0 ? ((this.kpm_calc - this.b_kpm) / this.b_kpm) * 100 : 0)

  gpm_status = $derived(this.gpm_diff >= 0 ? 'up' : 'down')
  xpm_status = $derived(this.xpm_diff >= 0 ? 'up' : 'down')
  kpm_status = $derived(this.kpm_diff >= 0 ? 'up' : 'down')

  gpm_label = $derived(this.getLabel(this.gpm_diff))
  xpm_label = $derived(this.getLabel(this.xpm_diff))
  kpm_label = $derived(this.getLabel(this.kpm_diff))

  private getLabel(diff: number): string {
    if (diff > 20) return 'High'
    if (diff > 0) return 'Above'
    if (diff > -20) return 'Avg'
    return 'Low'
  }

  updateFromGsi(data: any) {
    if (data.player) {
      this.gpm = data.player.gpm ?? 0
      this.xpm = data.player.xpm ?? 0
      this.kills = data.player.kills ?? 0
    }
    if (data.hero) {
      this.b_gpm = data.hero.benchmark_gpm ?? 0
      this.b_xpm = data.hero.benchmark_xpm ?? 0
      this.b_kpm = data.hero.benchmark_kpm ?? 0
    }
    if (typeof data.clock === 'number') {
      this.clock = data.clock
    }
  }
}

export const overlayStore = new OverlayStore()
