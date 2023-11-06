const transformArrayKey = (key) => {
  if (!key.indexOf('[')) return (key, null);
  const arrayIndex = key.substring(key.indexOf('[') + 1, key.indexOf(']'));
  const baseKey = key.replace(`[${arrayIndex}]`, '');

  return { root: baseKey, arrayIndex };
}

let mixin = {
  // object is set when using the Object class itself and not an instance of an object
  // i.e.: Object.isEmpty(myObject) vs. myObject.isEmpty()
  isEmpty(object) {
    return Object.keys(object || this).length === 0;
  },

  isKeyPopulated(object, key) {
    if (Object.isEmpty(object)) return false;
    if (key.indexOf('.') > 0) {
      let { root, arrayIndex } = transformArrayKey(key.substring(0, key.indexOf('.')));
      if (!(root in object)) return false;
      
      const nextKey = key.substring(key.indexOf('.') + 1)
      return arrayIndex 
        ? isKeyPopulated(object[root][arrayIndex], nextKey) 
        : isKeyPopulated(object[root], nextKey);
    } else {
      let { root, arrayIndex } = transformArrayKey(key);
      if (!(root in object)) return false;
      const value = arrayIndex ? object[root][arrayIndex] : object[root];
      if (typeof value === 'undefined' || value === null) return false;
      if (typeof value === 'string' && value === '') return false;
      if (typeof value === 'object' && Object.isEmpty(value)) return false;
      if (Array.isArray(value)) return value.length > 0;
      
      return true;
    }
  }
}

Object.setPrototypeOf(mixin, Object.prototype);

export default mixin;