let mixin = {
  setOrIncrementKey(key, increment = 1) {
    let value = super.get(key) ?? 0;
    super.set(key, value += increment);
  }
}

Object.setPrototypeOf(mixin, Map.prototype);

export default mixin;