import { computed, readonly, shallowRef } from "vue";
import { clearKey, getKey, setKey } from "../api";

// estado compartilhado entre todos os componentes
const key = shallowRef(getKey());

export function useApiKey() {
    function save(value: string) {
        const trimmed = value.trim();
        setKey(trimmed);
        key.value = trimmed;
    }
    function forget() {
        clearKey();
        key.value = "";
    }
    const hasKey = computed(() => key.value.length > 0);

    return { key: readonly(key), hasKey, save, forget };
}
