import { Link } from "react-router-dom";

interface ButtonSliderProps {
  to: string;
  text: string;
}

export default function ButtonSlider({ to, text }: ButtonSliderProps) {
  return (
    <Link to={to} className="btn btn-arrow">
      <div className="btn-arrow__wrap">
        <span className="btn-arrow__text">{text}</span>
        <div className="btn-arrow__circle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" width="18" height="18">
            <path d="M13.0457 8.13128L5.8733 15.3037L4.69479 14.1252L11.8672 6.95277L5.54568 6.95277L5.54568 5.28636H14.7121V14.4528L13.0457 14.4528V8.13128Z" fill="currentColor" />
          </svg>
        </div>
        <div className="btn-arrow__bg"></div>
      </div>
    </Link>
  );
}