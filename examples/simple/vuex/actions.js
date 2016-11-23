
function makeAction(type) {
  return ({ commit }, payload) => commit(type, payload)
}

export const addNode = makeAction('UPDATE_FIELD')
