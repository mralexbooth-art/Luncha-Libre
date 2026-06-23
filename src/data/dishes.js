// Hand-authored dishes for V4's cozy DishMaker. Each entry mirrors the
// shape of a synthesized "wrestler" but isn't tied to the combat engine —
// V4 just shows the dish on the altar and treats it as a memento.

export const EL_DULCE_CAMPEON = {
  id: 'recipe-dulce-campeon',
  name: 'El Dulce Campeón',
  flavor: 'Hideous. Childish. Wonderful.',
  archetype: 'spirit',
  attack: 6,
  health: 20,
  nutrition: {
    protein: 12, carbs: 26, fat: 18,
    fiber: 1, sugar: 15, sodium: 9,
    calories: 70,
  },
  special: {
    name: 'Cheat Day',
    description:
      'Once per battle, ignore all negative nutrition penalties. Friendly dishes gain Sugar Haste. Gain 2 Spirit Favor.',
  },
}
