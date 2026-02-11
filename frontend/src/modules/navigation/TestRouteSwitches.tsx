import { Link } from 'react-router-dom';

type TestRouteSwitchesProps = {
  className?: string;
};

export function TestRouteSwitches({ className }: TestRouteSwitchesProps) {
  return (
    <nav className={className} aria-label="test route switches">
      {/* TEST ONLY: these 3 buttons are temporary route switches for integration testing. */}
      <Link className="switch-btn" to="/works">
        Works
      </Link>
      <Link className="switch-btn" to="/why">
        Why
      </Link>
      <Link className="switch-btn" to="/about">
        About
      </Link>
    </nav>
  );
}
