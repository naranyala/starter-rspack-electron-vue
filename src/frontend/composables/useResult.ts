import { type Ref, ref } from 'vue';
import type { Result } from '../../shared/errors';
import { isErr, isOk } from '../../shared/errors';

export interface UseResultState<T, E> {
  value: Ref<T | null>;
  error: Ref<E | null>;
  isLoading: Ref<boolean>;
  isOk: Ref<boolean>;
  isErr: Ref<boolean>;
}

export function useResult<T, E = Error>() {
  const value = ref<T | null>(null) as Ref<T | null>;
  const error = ref<E | null>(null) as Ref<E | null>;
  const isLoading = ref(false);
  const isOkState = ref(false);
  const isErrState = ref(false);

  function setResult(result: Result<T, E>) {
    if (isOk(result)) {
      value.value = result.value;
      error.value = null;
      isOkState.value = true;
      isErrState.value = false;
    } else {
      value.value = null;
      error.value = result.err;
      isOkState.value = false;
      isErrState.value = true;
    }
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading;
  }

  function reset() {
    value.value = null;
    error.value = null;
    isLoading.value = false;
    isOkState.value = false;
    isErrState.value = false;
  }

  return {
    value,
    error,
    isLoading,
    isOk: isOkState,
    isErr: isErrState,
    setResult,
    setLoading,
    reset,
  };
}

export function useResultCallback<T, E = Error>(callback: () => Promise<Result<T, E>>) {
  const state = useResult<T, E>();

  async function execute(...args: Parameters<typeof callback>) {
    state.setLoading(true);
    state.reset();

    try {
      const result = await callback(...args);
      state.setResult(result);
    } catch (e) {
      state.error.value = e as E;
      state.isErr.value = true;
    } finally {
      state.setLoading(false);
    }

    return state;
  }

  return {
    ...state,
    execute,
  };
}
