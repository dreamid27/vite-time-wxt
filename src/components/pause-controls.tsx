import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Pause, Play } from 'lucide-react';
import { db } from '@/db/blocked-sites-db';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PauseControlsProps {
  onPauseStateChange: (isPaused: boolean) => void;
}

export const PauseControls = ({ onPauseStateChange }: PauseControlsProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<string>('10');

  useEffect(() => {
    checkPauseState();
    const interval = setInterval(checkPauseState, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkPauseState = async () => {
    const pauseState = await db.pauseState.toArray();
    const activePause = pauseState.find((state) => state.isActive);

    if (activePause) {
      const startTime = new Date(activePause.startTime).getTime();
      const endTime = startTime + activePause.duration * 60 * 1000;
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));

      if (remaining === 0) {
        await deactivatePause();
      } else {
        setRemainingTime(remaining);
        setIsPaused(true);
        onPauseStateChange(true);
      }
    } else {
      setRemainingTime(null);
      setIsPaused(false);
      onPauseStateChange(false);
    }
  };

  const handlePause = async () => {
    try {
      // Deactivate any existing pause
      await deactivatePause();

      const duration = parseInt(selectedDuration);

      // Create new pause state
      await db.pauseState.add({
        id: crypto.randomUUID(),
        startTime: new Date().toISOString(),
        duration,
        isActive: true,
      });

      setIsPaused(true);
      onPauseStateChange(true);
      toast.success('Pause activated', {
        description: `Blocking will resume in ${duration} minutes.`,
      });
    } catch (error) {
      console.error('Error setting pause:', error);
      toast.error('Failed to activate pause');
    }
  };

  const deactivatePause = async () => {
    try {
      const pauseState = await db.pauseState.toArray();
      const activePause = pauseState.find((state) => state.isActive);
      if (activePause) {
        await db.pauseState.update(activePause.id, { isActive: false });
      }
    } catch (error) {
      console.error('Error deactivating pause:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isPaused && remainingTime !== null) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Paused</span>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {formatTime(remainingTime)}
          </div>
          <p className="text-sm text-yellow-600 dark:text-yellow-500">
            until blocking resumes
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => deactivatePause()}
          className="w-full border-yellow-200 dark:border-yellow-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
        >
          <Play className="h-4 w-4 mr-2" />
          Resume Now
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Select value={selectedDuration} onValueChange={setSelectedDuration}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.167">10 seconds</SelectItem>
            <SelectItem value="0.25">15 seconds</SelectItem>
            <SelectItem value="0.5">30 seconds</SelectItem>
            <SelectItem value="10">10 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="120">2 hours</SelectItem>
            <SelectItem value="240">4 hours</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="destructive"
          onClick={handlePause}
          size="sm"
          className="flex-1"
        >
          <Pause className="h-4 w-4 mr-2" />
          Pause
        </Button>
      </div>
    </div>
  );
};
