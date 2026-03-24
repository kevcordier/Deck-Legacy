import { useTranslation } from 'react-i18next';
import gloryIcon from '@assets/icons/glory.svg';
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
          <img src={gloryIcon} className="gos-glory-icon" alt="" />
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
