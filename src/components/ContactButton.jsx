import './ContactButton.css';

export default function ContactButton() {
  return (
    <button className="contact-btn" aria-label="Contact Us">
      <span className="contact-arrow">↗</span>
      <span>Contact Us</span>
    </button>
  );
}
