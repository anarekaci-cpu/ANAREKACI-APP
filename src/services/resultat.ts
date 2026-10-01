/**
 * Type de retour commun des services : on retourne une erreur lisible au lieu
 * de lever une exception, ce qui permet aux server actions d'afficher le
 * message tel quel à l'utilisateur.
 */
export type Resultat<T = void> = { ok: true; data: T } | { ok: false; erreur: string }

export const ok = <T>(data: T): Resultat<T> => ({ ok: true, data })
export const ko = (erreur: string): Resultat<never> => ({ ok: false, erreur })
