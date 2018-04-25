/**
 * Actions types
 */
export const AFFICHER      = 'AFFCIHER';
export const ADDITIONNER   = 'ADDITIONNER';
export const APPUYER_SUR_UNE_TOUCHE_NUMERIQUE   = 'APPUYER_SUR_UNE_TOUCHE_NUMERIQUE';
export const DIVISER       = 'DIVISER';
export const MULTIPLIER    = 'MULTIPLIER';
export const REINITIALISER = 'REINITIALISER';
export const SOUSTRAIRE    = 'SOUSTRAIRE';
export const VALIDER       = 'VALIDER';

/*
 * other constants
 */
export const ChoixAffichage = {
  MONTRER_RESULTAT: 'MONTRER_RESULTAT',
  MONTRER_SAISI_INTERMEDIAIRE: 'MONTRER_SAISI_INTERMEDIAIRE',
  MONTRER_OPERANDE_1: 'MONTRER_OPERANDE_1',
  MONTRER_OPERANDE_2: 'MONTRER_OPERANDE_2'
}

/**
 * Actions creators
 */

export function addtionner() {
  return { type: ADDITIONNER};
}

export function affcher(typeAffichage) {
   return { type: AFFICHER, typeAffichage };
}

export function appuyerSur(unChiffre) {
   return { type: APPUYER_SUR_UNE_TOUCHE_NUMERIQUE, unChiffre };
}
 
export function diviser() {
   return { type: DIVISER };
}

export function multiplier() {
   return { type: MULTIPLIER };
}

export function reinitialiser() {
   return { type: REINITIALISER };
}

export function soustraire() {
   return { type: SOUSTRAIRE };
}

export function valider() {
  return { type: VALIDER };
}