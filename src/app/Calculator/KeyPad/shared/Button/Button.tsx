import './Button.css';

/** Props of {@link Button}. */
interface ButtonProps {
  /** Called with the label when the key is pressed. Without it, a press does nothing. */
  onClick?: (label: string) => void;
  /** Text shown on the key and passed to `onClick`. @default '' */
  label?: string;
  /** Whether the key is twice as wide, like the `0` key. @default false */
  isLarge?: boolean;
}

/** Renders a key of the keypad, which passes its label to `onClick` when it is pressed. */
export function Button({ onClick, label = '', isLarge = false }: ButtonProps) {
  let className = 'btn';

  if (isLarge) {
    className += ' btn-large';
  }

  return (
    <div
      onClick={() => {
        onClick?.(label);
      }}
      className={className}
    >
      {label}
    </div>
  );
};
