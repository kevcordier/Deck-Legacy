import './PillBtn.css';

interface PillBtnProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  variant: 'gold' | 'ghost' | 'warning';
  large?: boolean;
}

export function PillBtn({ onClick, disabled, children, variant, large }: PillBtnProps) {
  const cls = `btn btn-${variant} pill-btn${large ? ' pill-btn--large' : ''}`;
  return (
    <button onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
