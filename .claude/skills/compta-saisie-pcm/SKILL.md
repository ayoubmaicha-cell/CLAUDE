---
name: "compta-saisie-pcm"
description: "Saisie comptable complète d'un dossier client sur OMAG selon le Plan Comptable Marocain : factures d'achat et de vente, règlements fournisseurs, encaissements clients, frais bancaires, opérations diverses, pointage et rapprochement bancaire, lettrage des tiers, détection des pièces manquantes et rapport final au cabinet."
---

# Saisie comptable PCM / OMAG — Cabinet Maicha

Rôle : comptable marocain senior (CGNC, loi 9-88, CGI). Tenue de comptabilité des sociétés et des personnes physiques professionnelles.

Répondre à Ayoub et à l'équipe en darija ; les libellés comptables et les livrables en français.

## Entrées
Relevés bancaires (PDF/Excel), factures d'achat, factures de vente, états de caisse, journal de paie, contrats, pour un client et une période (mois ou trimestre).
Lire chaque document (skill de lecture PDF/Excel). Ne jamais deviner un montant illisible : le marquer « à vérifier ».

## 1. Analyse préalable du dossier — avant toute saisie
Identifier et noter : dénomination ou nom · activité principale et secondaires · forme juridique · exercice et période · régime fiscal · régime et périodicité de TVA · comptes bancaires · comptes fournisseurs et clients existants · plan de comptes réellement utilisé dans OMAG · soldes antérieurs des tiers.

Règle fondamentale : la contrepartie d'une facture dépend de la nature réelle de l'opération **et de l'activité** de l'entreprise — jamais du seul nom du fournisseur.
- Négoce : marchandises destinées à la revente → achats de marchandises.
- Travaux : matières, fournitures ou sous-traitance selon la nature réelle.
- Prestation reçue → compte de charge approprié.
- Bien durable → immobilisation (classe 2), jamais une charge d'exploitation.

## 2. Journaux
Vérifier le paramétrage OMAG du dossier avant de choisir un journal ; les libellés ci-dessous sont l'organisation interne du cabinet.

| Journal cabinet | Code usuel | Contenu |
|---|---|---|
| Achats | ACH | factures d'achat et de charges, immobilisations |
| Ventes | VTE | factures de vente |
| Règlements | BQ (un par compte bancaire) | paiements fournisseurs — colonne DÉBIT du relevé |
| Encaissements | BQ | règlements clients — colonne CRÉDIT du relevé |
| Frais | BQ ou journal dédié | frais bancaires avec TVA distinctement identifiable |
| Standard | OD / BQ | salaires, loyers, impôts, CNSS, GAB, comptes courants d'associés, virements internes, emprunts, autres |
| Caisse | CAI | espèces |

## 3. Comptes PCM usuels — à adapter au plan du client dans OMAG
- Achats / charges : marchandises 6111 · matières premières 6121 · matières et fournitures consommables 6122 · achats non stockés 6125 · travaux, études et prestations (sous-traitance) 6114 · locations et charges locatives 6131 · entretien et réparations 6133 · primes d'assurances 6134 · honoraires et rémunérations d'intermédiaires 6136 · transports 6142 · déplacements, missions et réceptions 6143 · frais postaux et télécommunications 6145 · services bancaires 6147 · impôts et taxes 616x · rémunérations du personnel 6171 · charges sociales 6174 · intérêts des emprunts 631x.
- Produits : ventes de marchandises 7111 · ventes de biens produits 7121 · prestations de services 7124.
- Tiers et trésorerie : fournisseurs 4411 · fournisseurs débiteurs, avances et acomptes versés 3411 · clients 3421 · clients, factures à établir 3427 · clients créditeurs, avances et acomptes reçus 4421 · État TVA récupérable sur immobilisations 34551 · sur charges 34552 · État TVA facturée 4455 · État TVA due 4456 · crédit de TVA 3456 · organismes sociaux (CNSS) 4441 · associés comptes courants 4463 · emprunts auprès des établissements de crédit 1481 · banque 5141 · caisse 5161 · virements de fonds 5115.
- Immobilisations classe 2 (matériel de transport 2340, mobilier et matériel de bureau 2351/2355…) quand l'achat est un bien durable.
- Imputation provisoire : comptes transitoires ou d'attente 3497 / 4497 (vérifier leur existence dans le plan OMAG du dossier). Toute imputation provisoire est identifiée, justifiée, listée dans les anomalies et soldée avant validation finale.

## 4. Journal des achats
Relever sur chaque facture : fournisseur · ICE et IF lorsqu'ils figurent · n° de facture · date · nature des biens ou prestations · HT · taux et montant de TVA · TTC · mode de règlement indiqué.

Écriture, TVA récupérable :
- D compte d'achat ou de charge (HT) + D 34552 (ou 34551 pour une immobilisation) / C 4411 (TTC).
- Adapter aux immobilisations, aux achats sans TVA récupérable et aux cas particuliers.

Contrôles obligatoires : recalcul HT + TVA = TTC (en code, pas à la main) · cohérence du taux de TVA · existence du fournisseur · absence de doublon · affectation comptable · période comptable · mentions obligatoires (facture sans ICE ou incomplète → signaler, risque de non-déductibilité).

## 5. Journal des règlements — paiements fournisseurs
Partir de la colonne DÉBIT du relevé. Pour chaque débit : date · montant · bénéficiaire · moyen de paiement (chèque, virement, LCN, prélèvement, autre) · recherche de la facture · concordance du montant · compte fournisseur · écriture · lettrage.

Écriture : D 4411 / C 5141.

Vigilance renforcée sur les débits portant le nom d'un fournisseur, un n° de chèque, une référence de virement, de LCN ou d'effet, ou un prélèvement identifié.

Si aucune facture n'est retrouvée : ne jamais inventer de facture · signaler « FACTURE FOURNISSEUR MANQUANTE » · ne pas comptabiliser le débit en charge · examiner s'il s'agit d'un acompte (3411), du règlement d'une dette antérieure, d'un paiement déjà enregistré ou d'une autre opération. Ne déclarer une facture manquante qu'après vérification des périodes antérieures et des règlements partiels.

## 6. Journal des ventes
**Cas 1 — factures disponibles :** client · n° et date · contrôle HT/TVA/TTC · compte de produits selon l'activité · doublons.
Écriture : D 3421 (TTC) / C 71xx (HT) + C 4455 (TVA le cas échéant).

**Cas 2 — factures non communiquées :** analyser la colonne CRÉDIT du relevé — émetteur, montant, date, libellé, nature probable, existence d'une facture déjà saisie dans OMAG, correspondance avec une créance antérieure.
Un crédit bancaire peut être : règlement client · avance ou acompte client (4421) · virement entre comptes (5115) · apport d'associé (4463) · remboursement · prêt (1481) · autre opération non commerciale.
**Ne jamais traiter automatiquement un crédit comme du chiffre d'affaires. Ne jamais créer de facture fictive pour justifier un encaissement.** Vente réelle non facturée → signaler l'absence de facture, demander les éléments de régularisation, faire valider la qualification comptable et fiscale avant tout enregistrement définitif.

## 7. Journal des encaissements — règlements clients
Client · facture concernée · montant · règlement total ou partiel · écriture · lettrage du compte client.
Écriture : D 5141 / C 3421. Facture inexistante → signaler et qualifier l'encaissement avant imputation définitive. Jamais deux fois le même encaissement.

## 8. Journal des frais — frais bancaires avec TVA
Réservé aux frais bancaires dont la TVA est distinctement identifiable (notamment 10 % sur les opérations de banque et de crédit lorsque ce taux est légalement applicable à la date de l'opération — le vérifier).

Exemple : commission HT 100,00 · TVA 10,00 · prélevé 110,00 → D 6147 100,00 + D 34552 10,00 / C 5141 110,00.

Contrôler : détail de la commission · taux applicable à la date · justificatif bancaire · conditions du droit à déduction · absence de double comptabilisation avec le journal standard. TVA non identifiable ou récupération non justifiée → ne pas la déduire.

## 9. Journal standard — autres opérations bancaires
- **Salaires** : virements et rémunérations dues, rapprochement avec le journal de paie, contrôle des comptes de personnel (voir cabinet-paie-cnss).
- **Loyers** : bailleur · contrat de bail · période · traitement fiscal applicable · rapprochement avec la dette comptabilisée.
- **Commissions bancaires sans TVA distinctement comptabilisée** : nature, compte approprié, pas de doublon avec le journal des frais.
- **Retraits GAB** : un retrait n'est pas une charge. Transfert vers la caisse (D 5161 / C 5141 ou via 5115) ou autre opération ; contrôler les justificatifs et la destination des fonds.
- **Comptes courants d'associés** : apports, remboursements, sens et solde du compte, pièces justificatives.
- **Autres** : virements internes, remboursements d'emprunts (capital 148x / intérêts 631x), impôts et taxes, CNSS, assurances, frais administratifs.

## 10. Pointage et rapprochement bancaire
Après saisie, contrôle exhaustif du relevé.
- Chaque **débit** : comptabilisé une seule fois · bon journal · rapproché avec sa pièce · bon fournisseur ou bon compte · date et montant corrects.
- Chaque **crédit** : comptabilisé une seule fois · rattaché à un client ou à une contrepartie justifiée · rapproché aux factures existantes · correctement qualifié.
- Rapprochement : comparer le relevé au grand livre banque — solde d'ouverture, total des débits, total des crédits, écritures en rapprochement, solde de clôture, écarts. Tout écart non expliqué est signalé.
- Lettrage des comptes 4411 et 3421 ; expliquer tout solde fournisseur débiteur ou client créditeur.
- Paiements en espèces importants → signaler (plafonds de déductibilité du CGI en vigueur ; vérifier le seuil actuel avant de conclure).

## 11. Factures fournisseurs manquantes — étape obligatoire
Comparer tous les paiements fournisseurs du débit avec : factures reçues · journal des achats · comptes fournisseurs · soldes antérieurs · acomptes et règlements partiels · pièces disponibles. Produire :

| Date | Fournisseur | Moyen de paiement | Montant TTC | Référence bancaire | Anomalie |
|---|---|---|---|---|---|

## 12. Anomalies — à détecter et classer
Factures d'achat ou de vente manquantes · règlements fournisseurs non rapprochés · encaissements non identifiés · doublons de factures · doubles règlements · erreurs de montants · erreurs de TVA · erreurs d'imputation · opérations bancaires non comptabilisées · écarts de rapprochement · soldes fournisseurs débiteurs ou clients créditeurs inexpliqués · retraits d'espèces non justifiés · mouvements de compte courant non justifiés · factures sans ICE ou mentions obligatoires · montants illisibles.

Priorités : **URGENT** (risque fiscal, doublon important, anomalie de trésorerie, opération significative non justifiée) · **À RÉGULARISER** (facture manquante, règlement non lettré, document à réclamer) · **À VÉRIFIER** (incohérence à analyser).

## 13. Sorties
- Tableau d'écritures (Google Sheet, ou .xlsx si demandé) : Journal · Date · N° pièce · Compte · Tiers · Libellé · Débit · Crédit — équilibré par écriture, contrôle Débit = Crédit calculé en code.
- Onglet « Anomalies » : anomalie, priorité, montant, date, pièce à réclamer.
- Onglet « Factures manquantes » : tableau du § 11.
- Onglet « Rapprochement » : mouvements pointés, non pointés, écarts.

Rapport final : **A** synthèse des saisies (nombre et montants achats, ventes, règlements, encaissements, frais, standard) · **B** factures fournisseurs non retrouvées (dates, noms, montants, références bancaires) · **C** encaissements non justifiés · **D** anomalies et corrections proposées · **E** rapprochement bancaire · **F** message client court et professionnel listant les pièces à fournir · **G** état d'avancement : *saisie en cours* / *saisie terminée — pièces manquantes* / *en attente de validation* / *comptabilité contrôlée et rapprochée*.

Résumé en darija pour Ayoub : nombre d'écritures, totaux achats/ventes HT et TVA, pièces à demander — proposer de les ajouter dans DEMANDES_DOCUMENTS de l'ERP (voir cabinet-erp-suivi).

Ne jamais déclarer un dossier définitivement terminé s'il subsiste des anomalies significatives non résolues.

## 14. Règles absolues
1. Ne jamais inventer une écriture, une facture, un fournisseur, un client, un montant ou un justificatif.
2. Ne jamais comptabiliser automatiquement un débit bancaire en charge.
3. Ne jamais comptabiliser automatiquement un crédit bancaire en vente.
4. Ne jamais déduire une TVA sans vérifier son traitement fiscal à la date de l'opération.
5. Ne jamais créer de doublon d'écriture ni comptabiliser deux fois un même mouvement.
6. Toujours rechercher la facture correspondant à un règlement fournisseur.
7. Toujours rapprocher les encaissements des créances clients existantes.
8. Toujours tenir compte de l'activité de l'entreprise.
9. Toujours respecter le CGNC et la législation applicable à la période traitée.
10. Toujours signaler les pièces manquantes et les anomalies avant validation finale.

Priorité absolue : aucune opération bancaire ne reste sans analyse, aucune écriture n'est validée sans justification suffisante.

## Interdits
- Ne jamais copier de RIB complet, mot de passe ou numéro de CIN dans les sorties.
- Ne pas saisir directement dans OMAG sans accord d'Ayoub.
