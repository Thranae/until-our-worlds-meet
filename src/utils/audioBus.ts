/**
 * Centralized Audio Event Bus
 * Coordinates background music ducking whenever any sound or audio plays anywhere on the site.
 */

class AudioBus {
  private activeSources: Set<string> = new Set();
  private autoStopTimers: Map<string, number> = new Map();
  private debounceTimer: number | null = null;
  private isDucked: boolean = false;

  public reportAudioStart(sourceId: string, autoStopMs?: number): void {
    if (typeof window === 'undefined') return;

    // Clear any pending debounce stop
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    // Clear any previous auto-stop timer for this source
    if (this.autoStopTimers.has(sourceId)) {
      window.clearTimeout(this.autoStopTimers.get(sourceId));
      this.autoStopTimers.delete(sourceId);
    }

    const wasEmpty = this.activeSources.size === 0;
    this.activeSources.add(sourceId);

    if (wasEmpty || !this.isDucked) {
      this.isDucked = true;
      window.dispatchEvent(
        new CustomEvent('celestial-foreground-audio-start', { detail: { sourceId } })
      );
    }

    // If an estimated duration is provided, automatically schedule stop
    if (autoStopMs && autoStopMs > 0) {
      const timer = window.setTimeout(() => {
        this.reportAudioStop(sourceId);
      }, autoStopMs);
      this.autoStopTimers.set(sourceId, timer);
    }
  }

  public reportAudioStop(sourceId: string): void {
    if (typeof window === 'undefined') return;

    if (this.autoStopTimers.has(sourceId)) {
      window.clearTimeout(this.autoStopTimers.get(sourceId));
      this.autoStopTimers.delete(sourceId);
    }

    this.activeSources.delete(sourceId);

    // If there are still other sounds playing, do not restore yet
    if (this.activeSources.size > 0) return;

    // Debounce (220ms) to ensure smooth transitions between rapid audio cues
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      this.debounceTimer = null;
      if (this.activeSources.size === 0 && this.isDucked) {
        this.isDucked = false;
        window.dispatchEvent(new CustomEvent('celestial-foreground-audio-stop'));
      }
    }, 220);
  }

  public isForegroundActive(): boolean {
    return this.activeSources.size > 0;
  }
}

export const audioBus = new AudioBus();

// Global Auto-Ducking Interceptor for HTMLMediaElement and Web Audio sources
if (typeof window !== 'undefined' && !(window as any).__celestialAudioBusHooked) {
  (window as any).__celestialAudioBusHooked = true;

  try {
    // 1. Intercept HTMLMediaElement play/pause
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      const isBgm = (this as any)._isBgm || (typeof this.src === 'string' && this.src.includes('zaalima'));
      if (!isBgm) {
        const id =
          (this as any)._audioBusId ||
          ((this as any)._audioBusId = 'media_' + Math.random().toString(36).substring(2, 9));
        
        audioBus.reportAudioStart(id);

        const onStop = () => {
          audioBus.reportAudioStop(id);
        };

        this.removeEventListener('pause', onStop);
        this.removeEventListener('ended', onStop);
        this.removeEventListener('emptied', onStop);
        this.addEventListener('pause', onStop, { once: true });
        this.addEventListener('ended', onStop, { once: true });
        this.addEventListener('emptied', onStop, { once: true });
      }
      return origPlay.call(this);
    };

    // 2. Intercept Web Audio Scheduled Sources
    const ScheduledSource =
      (window as any).AudioScheduledSourceNode || (window as any).OscillatorNode;
    if (ScheduledSource && ScheduledSource.prototype) {
      const origSourceStart = ScheduledSource.prototype.start;
      const origSourceStop = ScheduledSource.prototype.stop;

      ScheduledSource.prototype.start = function (when?: number, ...args: any[]) {
        if (!(this as any)._ignoreAudioBus) {
          const id =
            (this as any)._audioBusId ||
            ((this as any)._audioBusId = 'webaudio_' + Math.random().toString(36).substring(2, 9));

          // Default fallback duration 3500ms in case stop/ended is delayed
          audioBus.reportAudioStart(id, 3500);

          const handleEnded = () => {
            audioBus.reportAudioStop(id);
          };
          this.addEventListener('ended', handleEnded, { once: true });
        }
        return origSourceStart.call(this, when, ...args);
      };

      if (origSourceStop) {
        ScheduledSource.prototype.stop = function (when?: number, ...args: any[]) {
          const id = (this as any)._audioBusId;
          if (id) {
            const ctx = (this as any).context;
            const delaySec =
              typeof when === 'number' && ctx ? Math.max(0, when - ctx.currentTime) : 0;
            const delayMs = Math.round(delaySec * 1000);
            setTimeout(() => {
              audioBus.reportAudioStop(id);
            }, delayMs);
          }
          return origSourceStop.call(this, when, ...args);
        };
      }
    }
  } catch {
    // Graceful fallback if browser restricts prototype patching
  }
}
