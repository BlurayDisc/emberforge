// The look of a hero between two shots. Classes without a pose of their own draw the ready look.
// ready: the weapon or spell is held. charge: a spell grows in the hand. released: the shot has left and the hand is empty. reload: the next arrow or light forms.
export type HeroPose = 'ready' | 'charge' | 'released' | 'reload';
