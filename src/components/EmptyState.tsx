export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="empty-state">
      <span className="icon">{icon}</span>
      <p>{text}</p>
    </div>
  );
}
