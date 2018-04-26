import { 
  ADDITIONNER, 
  AFFICHER, 
  APPUYER_SUR_UNE_TOUCHE_NUMÉRIQUE, 
  DIVISER,
  MULTIPLIER,
  TOUT_ÉFFACER,
  SOUSTRAIRE,
  VALIDER,
  INVERSER_LE_SIGNE,
  POURCENTAGE
} from './types';

/**
 * Générateurs d'actions
 */
export function addtionner() {
  return { type: ADDITIONNER};
}

export function affcher(typeAffichage) {
   return { type: AFFICHER, typeAffichage };
}

export function appuyerSur(unChiffre) {
   return { type: APPUYER_SUR_UNE_TOUCHE_NUMÉRIQUE, unChiffre };
}
 
export function diviser() {
   return { type: DIVISER };
}

export function multiplier() {
   return { type: MULTIPLIER };
}

export function toutÉffacer() {
   return { type: TOUT_ÉFFACER };
}

export function soustraire() {
   return { type: SOUSTRAIRE };
}

export function valider() {
  return { type: VALIDER };
}

export function inverserSigne(typeAffichage) {
  return { type: INVERSER_LE_SIGNE, typeAffichage};
}

export function pourcentage(typeAffichage) {
  return { type: POURCENTAGE, typeAffichage };
}