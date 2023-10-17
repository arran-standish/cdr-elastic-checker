let mixin = {
  // object is set when using the Object class itself and not an instance of an object
  // i.e.: Object.isEmpty(myObject) vs. myObject.isEmpty()
  isEmpty(object) {
    return Object.keys(object || this).length === 0;
  }
}

Object.setPrototypeOf(mixin, Object.prototype);

export default mixin;