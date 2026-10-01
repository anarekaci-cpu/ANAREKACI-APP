/** Un `template` est recréé à chaque navigation : parfait pour une transition d'entrée de page. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>
}
