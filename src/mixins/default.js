import { mapMutationsToMethod } from '../mapHelpersToMethod';

export default function(register) {
  const config = {
    onLoad(data) {
      this.dispatch('pageOnLoad', data);
    },
    onReady(data) {
      this.dispatch('pageOnReady', data);
    },
    onShow(data) {
      this.dispatch('pageOnShow', data);
    },
    onHide(data) {
      this.dispatch('pageOnHide', data);
    },
    onUnload(data) {
      this.dispatch('pageOnUnload', data);
    }
  };
  mapMutationsToMethod(this.methods, config);
  return register(config);
}
