let mixin = {
  setOrIncrementKey(key, increment = 1) {
    let value = super.get(key) ?? 0;
    super.set(key, value += increment);
  },
  isEmpty() {
    return super.size === 0;
  }
}

Object.setPrototypeOf(mixin, Map.prototype);

export default mixin;