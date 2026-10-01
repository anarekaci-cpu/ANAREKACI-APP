import { METHODE_LABELS, METHODES_PAIEMENT } from '@/config/association'
import { champCls, labelCls } from '@/components/ui'

/** Champs « méthode » + « référence » partagés par tous les formulaires de paiement. */
export default function ChampsPaiement() {
  return (
    <>
      <div>
        <label className={labelCls} htmlFor="methode">Méthode de paiement</label>
        <select id="methode" name="methode" required defaultValue="" className={champCls}>
          <option value="" disabled>Sélectionner</option>
          {METHODES_PAIEMENT.map((m) => (
            <option key={m} value={m}>{METHODE_LABELS[m]}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelCls} htmlFor="reference">Référence de transaction (optionnel)</label>
        <input id="reference" name="reference" type="text" maxLength={60} placeholder="N° reçu par SMS, n° de virement…" className={champCls} />
      </div>
    </>
  )
}
