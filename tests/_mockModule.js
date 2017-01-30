import System from 'systemjs';

export default function mockModule(name, value) {
  const normalizedName = System.normalizeSync(name);

  System.delete(normalizedName);
  System.set(normalizedName, System.newModule(Object.assign({ default: value }, value)));
}
