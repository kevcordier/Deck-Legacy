import { useTranslation } from 'react-i18next';
import { GloryIcon } from '@components/Icon';
import './GameOverScreen.css';

interface GameOverScreenProps {
  score: number;
  round: number;
  onNewGame: () => void;
}

export function GameOverScreen({ score, round, onNewGame }: GameOverScreenProps) {
  const { t } = useTranslation();

  return (
    <div className="gos-overlay">
      <div className="gos-panel">
        <div className="gos-title">{t('gameOver.title')}</div>

        <div className="gos-score">
          <GloryIcon className="gos-glory-icon" color="#e8b85a" />
          <span className="gos-score-value">{score}</span>
          <span className="gos-score-label">{t('gameOver.glory')}</span>
        </div>

        <div className="gos-stats">
          <div className="gos-stat">
            <span className="gos-stat-value">{round}</span>
            <span className="gos-stat-label">{t('gameOver.rounds')}</span>
          </div>
        </div>

        <button className="btn btn-gold pill-btn pill-btn--large gos-btn" onClick={onNewGame}>
          {t('gameOver.newGame')}
        </button>
      </div>
    </div>
  );
}
