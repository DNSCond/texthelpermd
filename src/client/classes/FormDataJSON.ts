// me
export class FormDataJSON extends FormData {
  toJSON() {
    const result: any = Object.create(null);
    // @ts-expect-error
    for (const [key, value] of this) {
      if (key in result) {
        result[key] = Array.isArray(result[key])
          ? [...result[key], value]
          : [result[key], value];
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}

function withResolvers<T>(): {
  promise: Promise<T>,
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (value?: any) => void,
} {
  let resolve: (value: T | PromiseLike<T>) => void, reject: (value?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  }); // @ts-expect-error
  return { promise, resolve, reject };
};

export function delayPromised<T>(ms: number): (value: T) => Promise<T> {
  const { promise, resolve } = withResolvers<T>();
  setTimeout(resolve, ms);
  return ((value: T) => promise.then(() => value));
}
