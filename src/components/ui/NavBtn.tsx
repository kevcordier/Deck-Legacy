import './NavBtn.css'

interface NavBtnProps {
  onClick: () => void
  disabled: boolean
  label: string
  title: string
}

export function NavBtn({ onClick, disabled, label, title }: NavBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="nav-btn"
    >
      {label}
    </button>
  )
}
