import { useEffect } from 'react';
import { AmbientTrack, getAmbientAudio } from '../../utils/ambientAudio';

export interface AmbientAudioControllerProps {
  track: AmbientTrack;
}

const AmbientAudioController: React.FC<AmbientAudioControllerProps> = ({ track }) => {
  useEffect(() => {
    const audio = getAmbientAudio();
    audio.start(track);
    return () => {
      // Don't destroy on track change — just stop. The singleton survives remounts.
      audio.stop();
    };
  }, [track]);

  return null;
};

export default AmbientAudioController;
