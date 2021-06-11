import { Query } from 'mingo';

export function conforms(object, rule) {
  return (new Query(rule)).test(object);
}

export function conformings(array, rule) {
  const query = new Query(rule);
  return array.filter(it => query.test(it));
}
