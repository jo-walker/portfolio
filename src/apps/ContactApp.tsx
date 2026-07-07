import { contact } from '../data/contact';

export function ContactApp() {
  return (
    <div className="app-pad">
      <p>Want to talk? The fastest way to reach me:</p>
      <ul className="contact-list">
        <li>✉️ <a href={`mailto:${contact.email}`}>{contact.email}</a></li>
        <li>🔗 <a href={contact.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
        <li>🐙 <a href={contact.github} target="_blank" rel="noreferrer">GitHub</a></li>
      </ul>
    </div>
  );
}
